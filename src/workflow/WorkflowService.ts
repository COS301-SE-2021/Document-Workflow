import { injectable } from "tsyringe";
import {WorkflowProps, WorkflowStatus} from './Workflow';
import WorkFlowRepository from './WorkflowRepository';
import DocumentService from "../document/DocumentService";
import UserService from "../user/UserService";
import {PhaseProps, PhaseStatus} from "../phase/Phase";
import { ObjectId } from "mongoose";
import { PhaseService } from "../phase/PhaseService";
import {RequestError, ServerError} from "../error/Error";

@injectable()
export default class WorkflowService{
    //Errors in Service files -> Internal Server Error

    constructor(
        private workflowRepository: WorkFlowRepository,
        private documentService: DocumentService,
        private userService: UserService,
        private phaseService: PhaseService) {
    }

    /**
     * We first create the workflow so that its ID can be generated. We then store the document
     * which requires its parent workflow id. Once we get the document id back we update our workflow.
     * Members is just an array of email addresses.
     * @param workflow
     * @param file
     * @param phases
     */
    async createWorkFlow(workflow: WorkflowProps, file: File, phases: PhaseProps[]): Promise<any>{

        console.log("In the createWorkFlow function");
        try {
            //Before any creation of objects takes place, checks must be done on the inputs to ensure that they are valid.
            const areValid = await this.arePhasesValid(phases);
            if(!areValid){
                console.log("Phase was malformed");
                return {status: "error", data:{}, message: "A phase contains a user that does not exist"}
            }
            console.log("ALL PHASES ARE VALID");
            phases[0].status = PhaseStatus.INPROGRESS;

            //Step 1 create Phases:
            console.log("Saving Phases");
            const phaseIds: ObjectId[] = [];
            for (const phase of phases) {
                phaseIds.push(await this.phaseService.createPhase(phase));
            }
            workflow.phases = phaseIds;
            console.log("Phases saved, saving workflow");

            //Step 2 create workflow to get workflowId:
            const workflowId = await this.workflowRepository.saveWorkflow(workflow);
            console.log("Workflow saved, saving document");

            //Step 3 save document with workflowId:
            const documentId = await this.documentService.uploadDocument(file, workflowId);
            console.log("THE DOCUMENT HAS BEEN CREATED AND THE WORKFLOW SHOULD HAVE THE DOCUMENT ID NOW!!!");
            console.log(workflow);
            console.log("Document saved, updating workflow");

            //Step 4 update workflow with documentId:
            await this.workflowRepository.addDocumentId(workflowId, documentId);
            console.log("Workflow updated, adding the workflow to the relevant users");

            console.log(workflow);

            await this.addWorkFlowIdToUsersWorkflows(phases, workflowId, workflow.ownerEmail);
            await this.addWorkFlowIdToOwnedWorkflows(workflowId, workflow.ownerEmail);
            return {status: "success", data: {id:workflowId}, message:""};
        }
        catch(e){
            //TODO rollback and rethrow
            throw e;
        }
    }
    //---------------------------------------Create Workflow Helper functions----------------------------------

    async arePhasesValid(phases):Promise<boolean>{
        //TODO: possibly add checks for a signer/signers
        console.log("Checking if phases are valid");
        console.log(typeof  phases);
        for(let i=0; i<phases.length; ++i) {
            console.log("Checking Phase: ", i+1);
            console.log(phases[i]);
            const usrs = JSON.parse(phases[i].users);
            if (!await this.checkUsersExist(usrs))
                return false;
        }

        return true;
    }

    async checkUsersExist(users):Promise<boolean>{
        console.log(users);
        for(let i=0; i<users.length; ++i){
            console.log("Checking if user ", users[i], " exists");
            const user = await this.userService.getUserByEmail(users[i].user);
            if(user === undefined || user === null)
                return false;
        }

        return true;
    }

    async addWorkFlowIdToUsersWorkflows(phases, workflowId, ownerEmail):Promise<void>
    {
        for(let i=0; i<phases.length; ++i) {
            let users = JSON.parse(phases[i].users);
            for(let k=0; k<users.length; ++k){
                let user = await this.userService.getUserByEmail(users[k].user);
                if(user.email != ownerEmail && !user.workflows.includes(workflowId))
                    user.workflows.push(workflowId);
                await this.userService.updateUserWorkflows(user);
            }
        }
    }

    async addWorkFlowIdToOwnedWorkflows(workflowId, ownerEmail):Promise<void>{
        console.log("Adding the workflow id to the workflows array of the owner " + ownerEmail);
        let user = await this.userService.getUserByEmail(ownerEmail);
        console.log(user.ownedWorkflows);
        user.ownedWorkflows.push(workflowId);
        console.log(user.ownedWorkflows);
        await this.userService.updateUserWorkflows(user);
    }

    //TODO: this function is strange and requires verification, also the way in which it returns data is strange
    async getWorkFlowById(id) {

        const workflow = await this.workflowRepository.getWorkflow(id);
        if(workflow === undefined || workflow === null)
            return {status:"error", data: {}, message:"workflow " + id + " not found"}

        let phases = [];

        for (const phaseId of workflow.phases) {
            phases.push(await this.phaseService.getPhaseById(phaseId));
        }

        //console.log(workflow);
        //console.log(phases);
        const data = {
            name: workflow.name,
            ownerId: workflow.ownerId,
            ownerEmail: workflow.ownerEmail,
            documentId: workflow.documentId,
            description: workflow.description,
            phases: phases,
            currentPhase: workflow.currentPhase
        };

        return {status:"success", data: data, message:""};
    }

    async deleteWorkFlow(workflowId, userEmail) {
        console.log("Attempting to delete workflow with id, ",workflowId);
        try {

            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            console.log(workflow);
            if(workflow === null)
                return {status: "failed", data: {}, message: "Workflow does not exist"};
            if(workflow.ownerEmail !== userEmail)
                return {status:"failed", data: {}, message: "Insufficient rights to delete"};

            await this.documentService.deleteDocument(workflowId, workflow.documentId);
            console.log("Document and metadata deleted");
            await this.removeOwnedWorkFlowId(workflow.ownerEmail, workflowId);
            //TODO: workflow only gets deleted up until this point. More testing is needed.

            for(let i=0; i<workflow.phases.length; ++i){
                const phase = await this.phaseService.getPhaseById(workflow.phases[i]);
                const phaseUsers = JSON.parse(phase.users);
                console.log("deleting workflow id from members of current phase");
                console.log(phaseUsers);
                for(let k=0; k<phaseUsers.length; ++k){
                    await this.removeWorkFlowId(phaseUsers[k].user, workflowId);
                }
                console.log("Deleting phase from workflow, phaseId: ", phase._id);
                await this.phaseService.deletePhaseById(phase._id);
            }

            console.log("Workflow ID removed from all participants");
            await this.workflowRepository.deleteWorkflow(workflowId);
            return {status: "success", data:{}, message:""};
        }
        catch(e){
            console.log(e);
            throw e;
        }
    }

    async removeOwnedWorkFlowId(email, workflowId){
        let user = await this.userService.getUserByEmail(email);
        const index = user.ownedWorkflows.indexOf(workflowId);
        if(index === -1)
            return;
        user.ownedWorkflows.splice(index, 1);
        await this.userService.updateUserWorkflows(user);
    }

    async removeWorkFlowId(email, workflowId){
        let user = await this.userService.getUserByEmail(email);
        const index = user.workflows.indexOf(workflowId);
        if(index === -1)
            return;
        user.workflows.splice(index, 1);
        await this.userService.updateUserWorkflows(user);
    }


    async getUsersWorkflowData(usr) {

        //we have the user's email and id, but we need to fetch this user from the UserService
        //So that we have the ids of workflows they are a part of, and that they
        try {
            const user = await this.userService.getUserById(usr._id);
            console.log("getting the users workflow data");
            console.log(user);
            let ownedWorkflows = [];
            let workflows = [];

            for(let i=0; i<user.ownedWorkflows.length; ++i){ //I couldnt find a prettier way of iterating through this, other methods did not work
                console.log(user.ownedWorkflows[i])
                let workflow = await this.workflowRepository.getWorkflow(String(user.ownedWorkflows[i]));
                let phases = [];

                for(let k=0; k<workflow.phases.length; ++k){
                    phases.push(await this.phaseService.getPhaseById(workflow.phases[k]));
                }
                workflow.phases = phases;
                ownedWorkflows.push(workflow);
            }

            for(let i=0; i<user.workflows.length; ++i)
            {
                console.log(user.workflows[i])
                let workflow = await this.workflowRepository.getWorkflow(String(user.workflows[i]));
                let phases = [];

                for(let k=0; k<workflow.phases.length; ++k){
                    phases.push(await this.phaseService.getPhaseById(workflow.phases[k]));
                }
                workflow.phases = phases;

                workflows.push(workflow);
            }
            const data = {ownedWorkflows, workflows};

            return {status: 'success', data:data, message:''};
        }
        catch(e){
            console.log(e);
            throw e;
        }
    }

    //TODO: finish implementing
    async updatePhase(user, workflowId, accept, document) {//NOTE: document will be null in the event that a viewer is updating the phase
        //first, retrieve the workflow based on the workflow id
        console.log("Updating a phase of a document");
        try{
            let workflow = await this.workflowRepository.getWorkflow(workflowId);
            if(workflow === null || workflow === undefined)
                throw new RequestError("The specified workflow does not exist");

            //we now fetch the phase to edit based on the workflows current phase index and phases array
            const currentPhaseID = workflow.currentPhase;
            let currentPhaseObject = await this.phaseService.getPhaseById(workflow.phases[currentPhaseID]);

            //Next, a check is done to ensure that this user is actually a participant of this phase and
            //if so, what their permissions are.
            let phaseUsers = JSON.parse(currentPhaseObject.users);
            let permission = '';
            let userFound = false;
            for(let i=0; i<phaseUsers.length; ++i){
                if(phaseUsers[i].user === user.email){
                    userFound = true;
                    permission = phaseUsers[i].permission;
                    phaseUsers[i].accepted = accept;
                }
            }
            currentPhaseObject.users = JSON.stringify(phaseUsers);
            if(!userFound)
                return {status:"error", data:{}, message:'You are not a part of this phase'};

            //At this point there are two things that must be done:
            //1) The phase must be checked to see if everyone accepts the phase. If they do, then the workflow
            //Progresses to the next phase. If this is the last phase of the workflow, the workflow must be considered
            //Completed
            //2) The document must be updated IFF the user's permission is to sign the document.
            if(this.isPhaseComplete(currentPhaseObject)){
                console.log("Phase is complete");
                currentPhaseObject.status = PhaseStatus.COMPLETED;
                if(workflow.phases.length === workflow.currentPhase + 1){
                    workflow.status = WorkflowStatus.COMPLETED;
                }
                else{
                    workflow.currentPhase = workflow.currentPhase + 1;
                    //Create the new folder in the S3 bucket for the next phases
                    await this.documentService.updateDocument(document, workflowId, workflow.currentPhase);
                    console.log("NEED TO CREATE THE FILE FOR THE NEXT FACE!!!!");
                }
            }

            if(permission === 'sign'){ //TODO: make the permission field an enum.
                await this.documentService.updateDocument(document, workflowId, workflow.currentPhase);
            }

            //Save everything
            await this.phaseService.updatePhase(currentPhaseObject);
            await this.workflowRepository.saveWorkflow(workflow);

            return {status:"success", data:{}, message:""};
        }
        catch(err){
            console.log(err);
            throw new ServerError(err);
        }
    }
    //my cat walked across my keyboard while I was typing this out. If there are any bugs, she is too blame.
    isPhaseComplete(phase){
        console.log("Checking if phase is completed");
        console.log(phase.users);
        const phaseUsers = JSON.parse(phase.users); //It is important to remember that the users of a phase are stored as a JSON string.
        for(let i=0; i<phaseUsers.length; ++i){
            if(phaseUsers[i].accepted === 'false')
                return false;
        }

        return true;
    }

    async retrieveDocument(workflowId, userEmail) {
        console.log('Retrieving a document for viewing');
        try{
            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            console.log(workflow);
            if(!workflow.documentId)
                console.log("BIG ERROR THIS WORKFLOW DOES NOT HAVE A DOCUMEnt ID!!!");
            if(!await this.isUserMemberOfWorkflow(workflow, userEmail)){
                console.log("REquesting user is NOT a member of this workflow");
                return {status:"error", data:{}, message:"You are not a member of this workflow"};
            }
            console.log("REquesting user is a member of this workflow");

            let data = await this.documentService.retrieveDocument(workflow.documentId, workflowId, workflow.currentPhase);
            const phase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
            data.annotations = phase.annotations;
            return {status: 'success', data: data, message:''};
        }
        catch(err){
            console.log(err);
            throw new ServerError(err);
        }
    }

    async isUserMemberOfWorkflow(workflow, email):Promise<boolean>{

        console.log('Checking if user: ', email, 'is a member of workflow ', workflow._id);
        if(workflow.ownerEmail === email)
            return true;

        for(let i=0; i<workflow.phases.length; ++i){
            const phase = await this.phaseService.getPhaseById(workflow.phases[i]);
            const phaseUsers = JSON.parse(phase.users);
            console.log(phaseUsers);
            for(let  k=0; k<phaseUsers.length; ++k){
                if(phaseUsers[k].user == email)
                    return true;
            }
        }

        return false;
    }

    /**
     * This function will be used to update the annotations of the current phase of the workflow to allow users
     * to comment on the phase regardless of whether or not they are viewers or signers.
     * @param userEmail
     * @param workflowId
     * @param annotations
     */
    async updatePhaseAnnotations(userEmail, workflowId, annotations) {
        console.log("Updating the annotations of a phase");
        try{
            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            if(!await this.isUserMemberOfWorkflow(workflow, userEmail)){
                console.log("REquesting user is NOT a member of this workflow");
                return {status:"error", data:{}, message:"You are not a member of this workflow"};
            }
            let phase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
            phase.annotations = annotations;

            await this.phaseService.updatePhase(phase);

            return {status:'success', data:{}, message:''};
        }
        catch(err){
            console.log(err);
            throw new ServerError("Could not update the annotations of the phase");
        }
    }

    //This function is not efficient
    async retrieveWorkflow(workflowId, email) {

        try {
            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            if(! await this.isUserMemberOfWorkflow(workflow, email)){
                return {status:"error", data:{}, message: ""};
            }
            return await this.getWorkFlowById(workflowId);
        }
        catch(err){
            console.log(err);
            throw new ServerError("Could not retrieve workflow");
        }
    }

    async editWorkflow(workflow: WorkflowProps, convertedPhases, requestingUser, workflowId) {
        console.log("Attempting to update a workflow");

        try{

            //1) Retrieve the workflow that we are going to be editing based on the input workflowId
            const workflowOriginal = await this.workflowRepository.getWorkflow(workflowId);
            //2) Check that the requesting user has the correct permissions to edit this workflow
            if(! workflowOriginal.ownerEmail === requestingUser)
                return {status: "error", data: {}, message: "Only the workflow owner can edit the workflow"};

            return {status: "success", data: {}, message: ''};
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    async revertWorkflowPhase(workflowId, email) {
        console.log("Attempting to revert the phase of a workflow");
        try{

            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            console.log(workflow);

            if(workflow.ownerEmail !== email){
                return {status: "error", data: {}, message: "Insufficient privileges to revert a workflow phase"};
            }

            //There are two phases when it comes to reverting a phase
            //1) The currentPhase is the start phase
            //2) The currentPhase is not the start phase
            //If the current phase is the start phase, all that need be done is fetch the original document from the S3
            //Bucket and then save it as the document for phase0
            //If the current phase is not the start phase then we set the currentPhase to be one less than it is
            //In both cases, the acceptance values of phase users need to change.

            if(workflow.currentPhase === 0){
                let currentPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
                console.log("Setting currentPhase acceptances to false");
                await this.setPhaseAcceptancesToFalseAndSave(currentPhase);
                await this.documentService.resetFirstPhaseDocument(workflowId, String(workflow.documentId));
            }
            else{
                //reset the acceptance values for members of the current phase and new phase
                let currentPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
                console.log("Setting currentPhase acceptances to false");
                await this.setPhaseAcceptancesToFalseAndSave(currentPhase);
                console.log("Setting new phase acceptances to false");
                let newPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase -1]);
                await this.setPhaseAcceptancesToFalseAndSave(newPhase);

                workflow.currentPhase --; //set the phaseId
            }
            if(workflow.status === WorkflowStatus.COMPLETED) {
                workflow.status = WorkflowStatus.INPROGRESS;
                await this.workflowRepository.updateWorkflow(workflow);
            }


            return {status:"success", data: {}, message: ""}
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }


    async setPhaseAcceptancesToFalseAndSave(phase) {

        let phaseUsers = JSON.parse(phase.users);
        for (let i = 0; i < phaseUsers.length; ++i) {
            console.log(phaseUsers[i]);
            phaseUsers[i].accepted = 'false';
        }

        phase.users = JSON.stringify(phaseUsers);
        await this.phaseService.updatePhase(phase);
    }
}