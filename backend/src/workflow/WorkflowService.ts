import { injectable } from "tsyringe";
import { WorkflowStatus } from './Workflow';
import WorkFlowRepository from './WorkflowRepository';
import DocumentService from "../document/DocumentService";
import UserService from "../user/UserService";
import { PhaseStatus } from "../phase/Phase";
import PhaseService from "../phase/PhaseService";
import { AuthorizationError, DatabaseError, RequestError, ServerError } from "../error/Error";
import WorkflowTemplateService from "../workflowTemplate/WorkflowTemplateService";
import WorkflowHistoryService from "../workflowHistory/WorkflowHistoryService";
import { ENTRY_TYPE } from "../workflowHistory/WorkflowHistory";
import { logger } from "../LoggingConfig";
import { IWorkflow } from "./IWorkflow";
import { IPhase } from "../phase/IPhase";
import { IUser } from "../user/IUser";
import { Types } from 'mongoose';

type ObjectId = Types.ObjectId;

@injectable()
export default class WorkflowService{
//TODO: This service might be violating the "single responsibility principle",
// with current implementation it is not possible to utilize it's functions effectively outside of this service
    constructor(
        private workflowRepository: WorkFlowRepository,
        private documentService: DocumentService,
        private userService: UserService,
        private phaseService: PhaseService,
        private workflowTemplateService: WorkflowTemplateService,
        private workflowHistoryService: WorkflowHistoryService
        ) {
    }

    /**
     * We first create the workflow so that its ID can be generated. We then store the document
     * which requires its parent workflow id. Once we get the document id back we update our workflow.
     * Members is just an array of email addresses.
     * @param workflow
     * @param file
     * @param phases
     * @param template
     * @param user
     */
    async createWorkFlow(workflow: IWorkflow, file, phases: IPhase[], template: any, user): Promise<Object>{
        try {
            //Before any creation of objects takes place, checks must be done on the inputs to ensure that they are valid.
            const areValid = await this.arePhasesValid(phases);
            if(!areValid){
                return {status: "error", data:{}, message: "A phase contains a user that does not exist"}
            }
            phases[0].status = PhaseStatus.INPROGRESS;

            //Step 1 create Phases:
            const phaseIds = [];
            for (const phase of phases) {
                phaseIds.push(String(await this.phaseService.createPhase(phase)));
            }
            workflow.phases = phaseIds;

            //Step 2 create workflow to get workflowId:
            const savedWorkflow = await this.workflowRepository.saveWorkflow(workflow);
            const workflowId = savedWorkflow._id;

            //Step 3 save document with workflowId:
            const documentId = await this.documentService.saveDocument(file, file.data, workflowId);

            //Step 4: Create the Workflow History for this workflow
            const historyData = await this.workflowHistoryService.createWorkflowHistory(workflow.ownerEmail, workflowId);

            //Step 5: update the workflows documentId, historyId, and hash
            //In order to use the save function to update a document, we require a document, not a documentProps
            //thus we fetch the workflow we have created in the database, update its parameters then we can update it effectively
            const workflowForUpdate: IWorkflow = await this.workflowRepository.getWorkflow(String(workflowId));
            workflowForUpdate.documentId = documentId;
            workflowForUpdate.historyId = historyData.id;
            workflowForUpdate.currentHash = historyData.hash;
            await this.workflowRepository.updateWorkflow(workflowForUpdate);

            //6) Add the new workflow Id to the workflow and ownedWorkflows fields of its participating users
            await this.addWorkFlowIdToUsersWorkflows(phases, workflowId, workflow.ownerEmail);
            await this.addWorkFlowIdToOwnedWorkflows(workflowId, workflow.ownerEmail);

            //Creat a template if this field is set
            if(template !== null){
                const templateId = await this.workflowTemplateService.createWorkflowTemplate(workflow, file, phases, template);
                const user = await this.userService.getUserById(workflow.ownerId);
                user.workflowTemplates.push(String(templateId));
                await this.userService.updateUser({body:user, params:{id: user._id}});
            }

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
        for(let i=0; i<phases.length; ++i) {
            const usrs = JSON.parse(phases[i].users);
            if (!await this.checkUsersExist(usrs))
                return false;
        }
        return true;
    }

    async checkUsersExist(users):Promise<boolean>{
        for(let i=0; i<users.length; ++i){
            const user = await this.userService.getUserByEmail(users[i].user);
            if(user === undefined || user === null)
                return false;
        }
        return true;
    }

    async addWorkFlowIdToUsersWorkflows(phases, workflowId: ObjectId, ownerEmail):Promise<void> {
        for(let i=0; i<phases.length; ++i) {
            let users = JSON.parse(phases[i].users);
            for(let k=0; k<users.length; ++k){
                let user = await this.userService.getUserByEmail(users[k].user);
                if(user.email != ownerEmail && !user.workflows.includes(String(workflowId)))
                    user.workflows.push(String(workflowId));
                await this.userService.updateUserWorkflows(user);
            }
        }
    }

    async addWorkFlowIdToOwnedWorkflows(workflowId: ObjectId, ownerEmail):Promise<void>{

        let user = await this.userService.getUserByEmail(ownerEmail);
        user.ownedWorkflows.push(String(workflowId));
        await this.userService.updateUserWorkflows(user);
    }

    //--------------------------------------------------------------------------------------------------------

    async getWorkFlowById(id: ObjectId) {

        const workflow: IWorkflow = await this.workflowRepository.getWorkflow(String(id));
        if(workflow === undefined || workflow === null)
            return {status:"error", data: {}, message:"workflow " + id + " not found"}

        let phases = [];

        for (const phaseId of workflow.phases) {
            phases.push(await this.phaseService.getPhaseById(phaseId));
        }

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

    /**
     * This function deletes a workflow by first deleting the document metadata and all files in the cloud server.
     * It then removes the id of this workflow from all participating users. Finally, it deletes the workflow itself.
     * @param workflowId
     * @param userEmail
     * TODO: ensure this function is robust in the event of network failure
     */
    async deleteWorkFlow(workflowId, userEmail) {
        try {
            const workflow = await this.workflowRepository.getWorkflow(workflowId);

            if(!workflow)
                return {status: "failed", data: {}, message: "Workflow does not exist"};
            if(workflow.ownerEmail && workflow.ownerEmail !== userEmail)
                return {status:"failed", data: {}, message: "Insufficient rights to delete"};

            for(let i=0; i<workflow.phases.length; ++i){
                const phase = await this.phaseService.getPhaseById(workflow.phases[i]);

                const phaseUsers = JSON.parse(phase.users);

                for(let k=0; k<phaseUsers.length; ++k){
                    await this.removeWorkFlowId(phaseUsers[k].user, workflowId);
                }
                await this.phaseService.deletePhaseById(phase._id);
            }

            //how do we know these functions succeeded?
            await this.removeOwnedWorkFlowId(workflow.ownerEmail, workflowId);

            //this is not deleting from s3
            await this.documentService.deleteDocument(workflowId, workflow.documentId);

            await this.workflowHistoryService.deleteWorkflowHistory(workflow.historyId);

            await this.workflowRepository.deleteWorkflow(workflowId);
            return {status: "success", data:{}, message:""};
        }
        catch(e){
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

    async getUsersWorkflowData(userId: ObjectId) {

        //we have the user's email and id, but we need to fetch this user from the UserService
        //So that we have the ids of workflows they are a part of, and that they
        try {
            const user: IUser = await this.userService.getUserById(userId);
            let ownedWorkflows = [];
            let workflows = [];

            for(let i=0; i<user.ownedWorkflows.length; ++i){ //I couldnt find a prettier way of iterating through this, other methods did not work
                let workflow = await this.workflowRepository.getWorkflow(user.ownedWorkflows[i]);
                let phases = [];

                for(let k=0; k<workflow.phases.length; ++k){
                    phases.push(JSON.stringify(await this.phaseService.getPhaseById(workflow.phases[k])));
                }
                workflow.phases = phases;
                ownedWorkflows.push(workflow);
            }

            for(let i=0; i<user.workflows.length; ++i)
            {
                let workflow = await this.workflowRepository.getWorkflow(user.workflows[i]);
                let phases = [];

                for(let k=0; k<workflow.phases.length; ++k){
                    phases.push(JSON.stringify(await this.phaseService.getPhaseById(workflow.phases[k])));
                }
                workflow.phases = phases;
                workflows.push(workflow);
            }
            const data = {ownedWorkflows, workflows};

            return {status: 'success', data:data, message:''};
        }
        catch(e){
            throw e;
        }
    }

    async updatePhase(user, workflowId, accept, document) {//NOTE: document will be null in the event that a viewer is updating the phase

        //first, retrieve the workflow based on the workflow id
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
        if(!userFound){
            throw new AuthorizationError("You are not a member of this phase");
        }

        if(permission === 'sign'){
            await this.documentService.updateDocument(document, workflowId, workflow.currentPhase);
            workflow.currentHash = await this.workflowHistoryService.updateWorkflowHistory(workflow.historyId, user, ENTRY_TYPE.SIGN, workflow.currentPhase);
        }

        if(accept){
            workflow.currentHash = await this.workflowHistoryService.updateWorkflowHistory(workflow.historyId, user, ENTRY_TYPE.ACCEPT, workflow.currentPhase);
        }
        else{
            workflow.currentHash = await this.workflowHistoryService.updateWorkflowHistory(workflow.historyId, user, ENTRY_TYPE.REJECT, workflow.currentPhase);
        }
        //At this point there are two things that must be done:
        //1) The phase must be checked to see if everyone accepts the phase. If they do, then the workflow
        //Progresses to the next phase. If this is the last phase of the workflow, the workflow must be considered
        //Completed
        //2) The document must be updated IFF the user's permission is to sign the document.
        if(this.isPhaseComplete(currentPhaseObject)){
            currentPhaseObject.status = PhaseStatus.COMPLETED;
            if(workflow.phases.length === workflow.currentPhase + 1){
                workflow.status = WorkflowStatus.COMPLETED;
            }
            else{
                workflow.currentPhase = workflow.currentPhase + 1;
                let newPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
                newPhase.status = PhaseStatus.INPROGRESS;
                await this.phaseService.updatePhase(newPhase);
                //Create the new folder in the S3 bucket for the next phases
                await this.documentService.updateDocument(document, workflowId, workflow.currentPhase);
            }
        }

        //Save everything
        await this.phaseService.updatePhase(currentPhaseObject);
        await this.workflowRepository.updateWorkflow(workflow);

        return {status:"success", data:{}, message:""};
    }

    //my cat walked across my keyboard while I was typing this out. If there are any bugs, she is to blame.
    isPhaseComplete(phase){

        const phaseUsers = JSON.parse(phase.users); //It is important to remember that the users of a phase are stored as a JSON string.
        for(let i=0; i<phaseUsers.length; ++i){
            if(phaseUsers[i].accepted === 'false')
                return false;
        }

        return true;
    }

    /**
     * This function is used to retrieve the data and metadata of a document for a workflow for a specific phase.
     * While there will exists a copy of the document for each phase of the workflow, the one that is fetched
     * by this function is determined by the currentPhase member/feature of a workflow. Doing this prevents
     * users from potentially inputting their own phaseNumber into the request and breaking the server.
     *  //TODO: add the hash of the currentWorkflowHistory entry to this document
     * @param workflowId
     * @param userEmail
     */
    async retrieveDocument(workflowId, userEmail) {

        const workflow = await this.workflowRepository.getWorkflow(workflowId);
        if(!workflow.documentId){
            throw new ServerError("There is no document associated with this workflow");
        }

        if(!await this.isUserMemberOfWorkflow(workflow, userEmail)){
            throw new AuthorizationError("You may not retrieve this workflow's details");
        }

        let data = await this.documentService.retrieveDocument(workflow.documentId, workflowId, workflow.currentPhase);
        const phase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
        data.annotations = phase.annotations;
        data.hash =  workflow.currentHash;
        return {status: 'success', data: data, message:''};

    }

    /**
     * This function checks that a given user (email) is actually a member of the given workflow
     * by fetching each phase of the workflow and checking that the user is present in at least one phase
     * of the workflow.
     * @param workflow
     * @param email
     */
    async isUserMemberOfWorkflow(workflow, email):Promise<boolean>{

        if(workflow.ownerEmail === email)
            return true;

        for(let i=0; i<workflow.phases.length; ++i){
            const phase = await this.phaseService.getPhaseById(workflow.phases[i]);
            const phaseUsers = JSON.parse(phase.users);
            for(let  k=0; k<phaseUsers.length; ++k){
                if(phaseUsers[k].user == email)
                    return true;
            }
        }

        return false;
    }

    /**
     * This function will be used to update the annotations of the current phase of the workflow to allow users
     * to comment on the phase regardless of whether or not they are viewers or signers. In essence, it allows
     * us to keep track of a document's history.
     * @param userEmail
     * @param workflowId
     * @param annotations
     */
    async updatePhaseAnnotations(userEmail, workflowId, annotations: string) {

        try{
            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            let phase: IPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
            let phaseUsers = JSON.parse(phase.users);
            let userFound = false;
            for(let i=0; i<phaseUsers.length; ++i){
                if(phaseUsers[i].user === userEmail){
                    userFound = true;
                }
            }
            if(!userFound){
                throw new AuthorizationError("You are not a member of this phase");
            }

            phase.annotations = annotations;


            if(await this.phaseService.updatePhaseAnnotations(phase)){
                return {status:'success', data:{}, message:''};
            }
        }
        catch(err){
            throw new ServerError("Could not update the annotations of the phase");
        }
    }

    /**
     * This function is used to retrieve a specific workflow and its data (excluding the file data)
     * for a corresponding workflowId. The input email is that of the requesting user, and is used to
     * verify that the requesting user is part of the workflow and may actually view the details of this workflow.
     * @param workflowId
     * @param email
     */
    async retrieveWorkflow(workflowId, email) {

        try {
            const workflow = await this.workflowRepository.getWorkflow(workflowId);
            if(! await this.isUserMemberOfWorkflow(workflow, email)){
                return {status:"error", data:{}, message: ""};
            }
            return await this.getWorkFlowById(workflowId);
        }
        catch(err){
            throw new ServerError("Could not retrieve workflow");
        }
    }

    /**
     *
     * @param workflowDescrip
     * @param workflowName
     * @param convertedPhases
     * @param requestingUser
     * @param workflowId
     */
    async editWorkflow(workflowDescrip, workflowName, convertedPhases, requestingUser, workflowId) {

        //1) Retrieve the workflow that we are going to be editing based on the input workflowId
        const workflowOriginal = await this.workflowRepository.getWorkflow(workflowId);

        //2) Check that the requesting user has the correct permissions to edit this workflow
        if(! workflowOriginal.ownerEmail === requestingUser)
            return {status: "error", data: {}, message: "Only the workflow owner can edit the workflow"};

        //3) Only phases up to and including the current phase can be edited. We extract these ids from the workflow.phases
        const preservePhasesIds = workflowOriginal.phases.slice(0, workflowOriginal.currentPhase +1); //+1 since slice does not include the end index
        //4) check that the user is not attempting to edit any of the phases they may not edit
        if(!this.allPhasesCanBeEdited(convertedPhases, preservePhasesIds)){
            return {status:"error", data:{}, message:""};
        }

        //5) For each phase, either create, edit, or delete.
        let addPhaseIds = [];
        for(let i=0; i<convertedPhases.length; ++i){
            if(convertedPhases[i].status === PhaseStatus.EDIT){

                //Right now that function requires a phase to be passed through
                const p = await this.phaseService.getPhaseById(convertedPhases[i]._id)
                p.description = convertedPhases[i].description;
                p.users = convertedPhases[i].users;
                p.annotations = convertedPhases[i].annotations;
                p.status = PhaseStatus.PENDING;
                addPhaseIds.push(convertedPhases[i]._id);

                await this.phaseService.updatePhase(p);
            }
            else if(convertedPhases[i].status === PhaseStatus.CREATE){
                delete convertedPhases[i]['_id'];
                convertedPhases[i].status = PhaseStatus.PENDING;
                addPhaseIds.push(await this.phaseService.createPhase(convertedPhases[i]));
            }
            else if(convertedPhases[i].status === PhaseStatus.DELETE){
                await this.phaseService.deletePhaseById(convertedPhases[i]._id);
            }
            else{
                //TODO: throw error
            }
        }

        workflowOriginal.phases = preservePhasesIds.concat(addPhaseIds);
        const hash = await this.workflowHistoryService.updateWorkflowHistory(workflowOriginal.historyId, {user: requestingUser}, ENTRY_TYPE.EDIT, workflowOriginal.currentPhase);
        workflowOriginal.currentHash = hash;
        await this.workflowRepository.updateWorkflow(workflowOriginal);

        return {status: "success", data: {}, message: ''};
    }

    /**
     * This function checks whether any of the phases to be edited occur in the array of phase ids that may
     * not be edited.
     * @param phases
     * @param preservePhasesIds
     */
    allPhasesCanBeEdited(phases, preservePhasesIds){

        for(let i=0; i<preservePhasesIds.length; ++i){
            for(let k=0; k<phases.length; ++k){
                if(preservePhasesIds[i]=== phases[k]._id)
                    return false;
            }
        }

        return true;
    }

    /**
     * The aim of this function is as follows: an owner of a workflow is unhappy with the current edits done
     * to a document and wants them to be redone. To do this, the reject the current phase and move the workflow
     * back to a previous phase. To do this, the necessary phases must be updated, documents updated in the
     * file server and all user's acceptance status's reset. This function handles the editing of the workflow
     * data, phase data and documents to achieve this effect.
     * @param workflowId
     * @param email
     */
    async revertWorkflowPhase(workflowId, email) {

        let workflow = await this.workflowRepository.getWorkflow(workflowId);
        let originalPhase = workflow.currentPhase;

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
            await this.phaseService.resetPhaseAndSave(currentPhase, PhaseStatus.INPROGRESS);
            await this.documentService.resetFirstPhaseDocument(workflowId, String(workflow.documentId));
        }
        else{
            //reset the acceptance values for members of the current phase and new phase
            let currentPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase]);
            await this.phaseService.resetPhaseAndSave(currentPhase, PhaseStatus.PENDING);
            let newPhase = await this.phaseService.getPhaseById(workflow.phases[workflow.currentPhase -1]);
            await this.phaseService.resetPhaseAndSave(newPhase, PhaseStatus.INPROGRESS);

            workflow.currentPhase = workflow.currentPhase - 1; //set the currentPhase to be one prior
        }

        workflow.status = WorkflowStatus.INPROGRESS;
        const hash = await this.workflowHistoryService.updateWorkflowHistory(workflow.historyId, {email: email}, ENTRY_TYPE.REVERT, originalPhase);
        workflow.currentHash = hash;
        await this.workflowRepository.updateWorkflow(workflow);

        return {status:"success", data: {}, message: ""};
    }

    async getOriginalDocument(workflowId, email) {

        const workflow = await this.workflowRepository.getWorkflow(workflowId);
        console.log(workflow);
        if(email !== workflow.ownerEmail)
            return {status: "error", data: {}, message: "Insufficient rights to retrieve this document"};

        return await this.documentService.retrieveOriginalDocument(workflow.documentId, workflowId);
    }

    async getWorkflowHistory(workflowId, email) {
        const workflow = await this.workflowRepository.getWorkflow(workflowId);

        if(!await this.isUserMemberOfWorkflow(workflow, email)){
            return new AuthorizationError("You do not have the privilege of viewing this workflow's history");
        }
        const workflowHistory = await this.workflowHistoryService.getWorkflowHistory(workflow.historyId);
        return {status:"success", data: {history: workflowHistory}, message:""};
    }

    async verifyDocument(workflowId, hash, user) {
        const workflow = await this.workflowRepository.getWorkflow(workflowId);

        if(!await this.isUserMemberOfWorkflow(workflow, user.email)){
            throw new AuthorizationError("You are not a member of this workflow");
        }

        const workflowHistory = await this.workflowHistoryService.getWorkflowHistory(workflow.historyId);

        for(let entry of workflowHistory.entries){
            const e = JSON.parse(String(entry));
            if(e.hash == hash){
                return {status:"success", data:{entry: entry}, message: ""};
            }
        }

        return {status:"error", data:{}, message:"No corresponding history entry was found for this document"};
    }
}