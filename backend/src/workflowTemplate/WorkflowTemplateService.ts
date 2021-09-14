import { injectable } from "tsyringe";
import WorkflowTemplateRepository from "./WorkflowTemplateRepository";
import DocumentService from "../document/DocumentService";
import UserService from "../user/UserService";
import { RequestError } from "../error/Error";
import { WorkflowTemplate } from "./WorkflowTemplate";
import { Types } from "mongoose";
import { IPhase } from "../phase/IPhase";
import { IUser } from "../user/IUser";

type ObjectId = Types.ObjectId;

@injectable()
export default class WorkflowTemplateService{

    constructor(
        private workflowTemplateRepository: WorkflowTemplateRepository,
        private userService: UserService,
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
     * @param template
     */
    async createWorkflowTemplate(workflow, file: File, phases: IPhase[], template): Promise<ObjectId>{

        template = JSON.parse(template);
        let newTemplate = new WorkflowTemplate({
            templateName: template.templateName,
            templateDescription: template.templateDescription,
            templateOwnerId: workflow.ownerId,
            templateOwnerEmail: workflow.ownerEmail,
            workflowName: workflow.name,
            workflowDescription: workflow.description,
            phases: JSON.stringify(phases),
            documentName: file.name

        });
        console.log(newTemplate);

        const templateId = await this.workflowTemplateRepository.saveWorkflowTemplate(newTemplate);
        await this.documentService.uploadTemplateDocumentToCloud(file, templateId);
        return templateId;
    }

    /**
     * Used to retrieve all the data stored by a workflow template so that it can be used by an end user to create
     * a new workflow without having to re-enter the same old information. This function has an extra check not persent in the
     * get name and description function. Since this function returns sensitive data (the document)
     * we must verify that this templateId belongs to teh requesting user.
     * @param templateId
     * @param usr
     */
    async getWorkflowTemplateData(templateId, usr){

        const user = await this.userService.getUserById(usr._id);
        if(!user.workflowTemplates.includes(templateId)){
            throw new RequestError("This template does not belong to you");
        }
        let template = await this.workflowTemplateRepository.findWorkflowTemplate(templateId);
        const fileData = await this.documentService.retrieveTemplateDocumentFromCloud(template._id, template.documentName);

        return {template: template, fileData: fileData};
    }

    /**
     * Fetches only the name and description of a WorkflowTemplate. To be used when only generic
     * information about a workflow template is required to avoid slow api calls due to sending large
     * the large annotations of the phases string back if it is not needed.
     * @param templateId
     */
    async getWorkflowTemplateNameAndDescription(templateId){
        const template = await this.workflowTemplateRepository.findWorkflowTemplate(templateId);
        return {templateName: template.templateName, templateDescription: template.templateDescription};
    }

    async deleteWorkflowTemplate(user: IUser, templateId) {
        const usr: IUser = await this.userService.getUserById(user._id);
        if(!user.workflowTemplates.includes(templateId)){
            throw new RequestError("This template does not belong to you");
        }
        await this.documentService.deleteTemplateDocumentFromCloud(templateId);
        await this.workflowTemplateRepository.deleteWorkflowTemplate(templateId);

        return {status: "success", data:{}, message:""};
    }
}