import { injectable } from "tsyringe";
import {WorkFlowI} from './WorkFlow';
import WorkFlowRepository from './WorkFlowRepository';
import DocumentService from "../document/DocumentService";
import UserRepository from "../user/UserRepository";
import DocumentRepository from "../document/DocumentRepository";

@injectable()
export default class WorkFlowService{

    constructor(private workflowRepository: WorkFlowRepository, private documentService: DocumentService, private usersRepository: UserRepository, private documentRepository: DocumentRepository) {
    }

    /**
     * We first create the workflow so that its ID can be generated. We then store the document
     * which requires its parent workflow id. Once we get the document id back we update our workflow.
     * Members is just an array of email addresses.
     * @param req
     */
    async createWorkFlow(req) :Promise<any>{

        const phases = this.stringIntoPhasesArray(req.body.phases);
        req.body.phases = phases;
        console.log(req.body.phases);
        console.log(phases);

        await this.checkUsersExist(phases);
        //Now that validation is complete we can create the workflow
        try{
            const workflow : WorkFlowI = {
                _id: null,
                name: req.body.name,
                description: req.body.description,
                owner_email: req.user.email,
                document_id: null,
                document_path: req.files.document.name,
                phases: req.body.phases
            }
            let workflow_id = await this.workflowRepository.postWorkFlow(workflow);
            let document_id = await this.documentService.uploadDocument(req.files.document, workflow_id);
            console.log("Workflow created and document uploaded, now updating the workflow");
            let _workflow = await this.workflowRepository.getWorkFlow(workflow_id);

            _workflow._id = workflow_id;
            _workflow.document_id = document_id;
            _workflow.document_path = workflow_id + "/" + workflow.document_path;

            await this.workflowRepository.putWorkFlow(_workflow);
            console.log("------------------------------------------------");

            console.log("Workflow successfully updated, adding id to the members of the workflow");
            await this.addWorkFlowIdToOwnedWorkflows(req.user.email, workflow_id);
            await this.addWorkFlowIdToUsersWorkflows(req.body.phases, workflow_id, req.user.email);
            return {status:'success', data:{}, message:''};
        }
        catch(err) {
            console.log(err);
            throw err;
        }
    }

    //---------------------------------------Create Workflow Helper functions----------------------------------

    async checkUsersExist(phases):Promise<boolean>{
        console.log("Checking if users exist");
        if(phases.length == 0)
            return true;
        for(let i =0; i<phases.length; ++i) {
            let users = phases[i];
            for (let email of users) {
                const result = await this.usersRepository.getUsers({email: email});
                if (result.length == 0) {
                    console.log("User " + email + " does not exist")
                    throw {status: "error", data:{}, message:"User " + email + " does not exist"};
                }
            }
        }

        return true;
    }

    async addWorkFlowIdToUsersWorkflows(phases, workflow_id, owner_email):Promise<void>
    {
        for(let i=0; i<phases.length; ++i) {
            let users = phases[i];
            for (let email of users) {
                const users = await this.usersRepository.getUsers({email: email});
                let user = users[0];
                if(user.email != owner_email && !user.workflows.includes(workflow_id))
                    user.workflows.push(workflow_id);
                await this.usersRepository.putUser(user);
            }
        }
    }

    async addWorkFlowIdToOwnedWorkflows(owner_email, workflow_id):Promise<void>{
        console.log("Adding the workflow id to the workflows array of the owner " + workflow_id);
        let users = await this.usersRepository.getUsers({email:owner_email});
        let user = users[0];
        console.log(user.owned_workflows);
        user.owned_workflows.push(workflow_id);
        console.log(user.owned_workflows);
        await this.usersRepository.putUser(user);
    }



    async getWorkFlowDetails(req) {

        let workflow_id = req.body.id;
        let workflow = await this.workflowRepository.getWorkFlow(workflow_id);
        if(workflow === null)
            throw {status:"error", data:{}, message:"Workflow does not exist"};
        let data = {
            name: workflow.name,
            owner_email: workflow.owner_email,
            document_path: workflow.document_path,
            description: workflow.description,
            phases: workflow.phases
        };
        return {status:"success", data: data, message:""};
    }

    private stringIntoPhasesArray(str: string): any[]{

        let arr = str.split(']');
        let result = [];

        for(let i=0; i<arr.length-1; ++i)
        {
            let sub_array= (arr[i].replace('[','').split(' '));
            if(sub_array.length !=0)
                result.push(sub_array);
        }

        return result;
    };

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
    }

    async updateDocument(req) {
        const documentMetadata = await this.documentRepository.getDocument(req.body.documentId);
        let v = await this.documentRepository.updateDocumentS3(documentMetadata, req.files.document);
        console.log("Document successfully updated");
        return {status: 'success', data:{}, response:''};
    }
}