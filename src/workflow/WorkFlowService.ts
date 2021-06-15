import { injectable } from "tsyringe";
import {WorkFlowI} from './WorkFlow';
import WorkFlowRepository from './WorkFlowRepository';
import DocumentService from "../document/DocumentService";

@injectable()
export default class WorkFlowService{

    //TODO: test that this works with the dependence injection
    constructor(private workflowRepository: WorkFlowRepository, private documentService: DocumentService)
    {

    }

    /**
     * We first create the workflowso that its ID can be generated. We then store the document
     * which requires its parent workflow id. Once we get the document id back we update our workflow.
     *
     * @param req
     */
    async createWorkFlow(req) :Promise<any>{
        //console.log(req);
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

            console.log("Workflow successfully updated");
            return "New workflow successfully created";
        }
        catch(err) {
            throw err;
        }
    }
}