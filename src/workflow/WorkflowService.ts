import { injectable } from "tsyringe";
import { WorkflowProps } from './Workflow';
import WorkFlowRepository from './WorkflowRepository';
import DocumentService from "../document/DocumentService";
import UserService from "../user/UserService";
import { PhaseProps } from "../phase/Phase";
import { ObjectId } from "mongoose";
import { PhaseService } from "../phase/PhaseService";

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
                throw "Error";
            }
            console.log("ALL PHASES ARE VALID");


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
            workflow.documentId = await this.documentService.uploadDocument(file, workflowId);
            console.log("Document saved, updating workflow");

            //Step 4 update workflow with documentId:
            await this.workflowRepository.updateWorkflow(workflow);
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
    /*
    async deleteWorkFlow(req) {
        console.log("Attempting to delete workflow");
        console.log(req.body);
        try {
            let workflow_id = req.body.id;
            const workflow = await this.workflowRepository.getWorkFlow(req.body.id);
            console.log(workflow);
            if(workflow === null)
                return {status: "failed", data: {}, message: "Workflow does not exist"};
            if(workflow.owner_email !== req.user.email)
                return {status:"failed", data: {}, message: "Insufficient rights to delete"};

            await this.documentService.deleteDocument(workflow_id, workflow.document_id);
            console.log("Document and metadata deleted");
            await this.removeOwnedWorkFlowId(workflow.owner_email, workflow_id);
            const phases = workflow.phases;
            for(let i=0; i<phases.length; ++i){
                const phase = phases[i];
                for(let k=0; k<phase.length; ++k)
                    if(phase[k] !== workflow.owner_email)
                        await this.removeWorkFlowId(phase[k], workflow_id);
            }
            console.log("Workflow ID removed from all participants");
            await this.workflowRepository.deleteWorkFlow(workflow_id);
        }
        catch(e){
            throw e;
        }

        return {status: "success", data:{}, message:""};
    }

    async removeOwnedWorkFlowId(email, id){
        let user = await this.usersRepository.getUser({email:email});
        const index = user.owned_workflows.indexOf(id);
        if(index === -1)
            return;
        user.owned_workflows.splice(index, 1);
        await this.usersRepository.putUser(user);
    }

    async removeWorkFlowId(email, id){
        let user = await this.usersRepository.getUser({email:email});
        const index = user.workflows.indexOf(id);
        if(index === -1)
            return;
        user.workflows.splice(index, 1);
        await this.usersRepository.putUser(user);
    }*/
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
}