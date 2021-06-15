import { injectable } from "tsyringe";
import {WorkFlowI} from './WorkFlow';
import WorkFlowRepository from './WorkFlowRepository';
import DocumentService from "../document/DocumentService";
import UserRepository from "../user/UserRepository";

@injectable()
export default class WorkFlowService{

    //TODO: test that this works with the dependence injection
    constructor(private workflowRepository: WorkFlowRepository, private documentService: DocumentService, private usersRepository: UserRepository)
    {

    }

    /**
     * We first create the workflowso that its ID can be generated. We then store the document
     * which requires its parent workflow id. Once we get the document id back we update our workflow.
     * Members is just an array of email addresses.
     * @param req
     */
    async createWorkFlow(req) :Promise<any>{
        //console.log(req);

        //Before we can create any workflow, we will have to do some validation
        if(req.body.members == undefined)
            req.body.members = [];
        if(typeof(req.body.members) == 'string')
            req.body.members = [req.body.members]
        let users_exist = await this.checkUsersExist(req.body.members)

        //Now that validation is complete we can create the workflow
        try{
            const workflow : WorkFlowI = {
                _id: null,
                owner_id: null,
                name: req.body.name,
                owner_email: req.body.owner_email,
                document_id: null,
                document_path: req.files.document.name,
                members: req.body.members
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
            await this.addWorkFlowIdToOwnedWorkflows(req.body.owner_email, workflow_id);
            return "New workflow successfully created";
        }
        catch(err) {
            throw err;
        }
    }

    //---------------------------------------Create Workflow Helper functions----------------------------------

    async checkUsersExist(users):Promise<boolean>{
        console.log("Checking if users exist");
        if(users.length == 0)
            return true;
        for (let email of users)
        {
            //console.log(email);
            const result = await this.usersRepository.getUsers({email: email});
            if(result.length == 0) {
                console.log("User " + email + " does not exist")
                throw "User " + email + " does not exist";
            }
        }

        return true;
    }

    async addWorkFlowIdToUsersWorkflows(users, workflow_id):Promise<void>
    {
        for (let email of users)
        {
            const users = await this.usersRepository.getUsers({email: email});
            let user = users[0];
            console.log(user.workflows);
            user.workflows.push(workflow_id);
            console.log(user.workflows);
            await this.usersRepository.putUser(user);
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
            members: workflow.members
        };

        return {status:"success", data: data, message:""};
    }
}