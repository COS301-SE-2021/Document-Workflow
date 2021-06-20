// import { injectable } from "tsyringe";
// import WorkFlow from './WorkFlow';
// import WorkFlowRepository from './WorkFlowRepository';
// import DocumentService from "../document/DocumentService";
// import RequestError from "../error/RequestError";
//
// @injectable()
// export default class WorkFlowService{
//
//     constructor(private workflowRepository: WorkFlowRepository, private documentService: DocumentService) {}
//
//     /**
//      * We first create the workflow so that its ID can be generated. We then store the document
//      * which requires its parent workflow id. Once we get the document id back we update our workflow.
//      *
//      * @param req
//      */
//     async createWorkFlow(req): Promise<WorkFlow>{
//         if(!req.user || !req.body.owner_id || req.files.document){
//             throw new RequestError("Missing Required Properties");
//         }
//         try{
//             const workflow = await this.workflowRepository.postWorkFlow(req.body);
//             if(workflow){
//
//             }
//
//             const document = await this.documentService.uploadDocument(req.files.document);
//             const document_id = document._id;
//             console.log("Workflow created and document uploaded, now updating the workflow");
//             let _workflow = await this.workflowRepository.getWorkFlow(workflow_id);
//
//             _workflow._id = workflow_id;
//             _workflow.document_id = document_id;
//             _workflow.document_path = workflow_id + "/" + workflow.document_path;
//
//             await this.workflowRepository.putWorkFlow(_workflow);
//
//             console.log("Workflow successfully updated");
//             return "New workflow successfully created";
//         }
//         catch(err) {
//             throw err;
//         }
//     }
// }