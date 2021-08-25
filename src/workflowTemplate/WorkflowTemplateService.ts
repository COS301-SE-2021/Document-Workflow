import {injectable} from "tsyringe";
import WorkflowTemplateRepository from "./WorkflowTemplateRepository";
import DocumentService from "../document/DocumentService";

@injectable()
export default class WorkflowService{

    constructor(
        private workflowTemplateService: WorkflowTemplateRepository,
        private documentService: DocumentService){
    }


}