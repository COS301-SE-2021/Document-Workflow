import {injectable} from "tsyringe";
import WorkflowTemplateRepository from "./WorkflowTemplateRepository";
import DocumentService from "../document/DocumentService";
import UserService from "../user/UserService";
import {Workflow} from "../workflow/Workflow";
import {WorkflowTemplate, WorkflowTemplateProps} from "./WorkflowTemplate";
import {PhaseProps} from "../phase/Phase";
import {ObjectId} from "mongoose";



@injectable()
export default class WorkflowService{

    constructor(
        private workflowTemplateRepository: WorkflowTemplateRepository,
        private documentService: DocumentService){
    }

    /**
     * This function is responsible for creating and a new workflow template, adding it's ID to the user
     * who created it (so that they can reference this template later on), and also ensuring that the document
     * for this template is saved safely on the cloud. Returns the Object ID for the template in the mongoDB
     * so that it can be added to a user's workflow templates.
     * @param workflow
     * @param file
     * @param phases
     * @param templateName
     */
    async createWorkflowTemplate(workflow, file: File, phases: PhaseProps[], templateName): Promise<ObjectId>{

        //TODO: cextract and stringyfy phase data then add it to the phases memebr variable.
        let template = new WorkflowTemplate({
            templateName: templateName,
            templateOwnerId: workflow.ownerId,
            templateOwnerEmail: workflow.ownerEmail,
            workflowName: workflow.name,
            workflowDescription: workflow.description,
            phases: [],
            documentName: file.name

        });
        const templateId = await this.workflowTemplateRepository.saveWorkflowTemplate(template);
        await this.documentService.uploadTemplateDocumentToCloud(file, templateId);
        return templateId;
    }

}