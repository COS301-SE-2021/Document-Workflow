import { injectable } from "tsyringe";
import {WorkFlowI} from './WorkFlow';
import WorkFlowRepository from './WorkFlowRepository';

@injectable()
export default class WorkFlowService{

    constructor(private workflowRepository: WorkFlowRepository)
    {

    }

    async createWorkFlow(req) :Promise<any>{
        console.log(req);
        //TODO: upload the file first or create the workflow first?
        try{
            const workflow : WorkFlowI = {
                _id: null,
                owner_id: null,
                name: req.body.name,
                owner_email: req.body.owner_email,
                document_id: "60b89ade8d0127f52f8fa6cd", //TODO: upload the document and get its name
                document_path: req.files.document.name, //TODO: set the document path to begin with this workflow's ID
                members: req.body.members
            }
            await this.workflowRepository.postWorkFlow(workflow);
            return "New workflow successfully created";
        }
        catch(err) {
            throw err;
        }
    }
}