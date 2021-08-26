import {WorkflowTemplate, WorkflowTemplateProps} from "./WorkflowTemplate";
import { ObjectId } from "mongoose";
import {ServerError} from "../error/Error";
import {Workflow, WorkflowProps} from "../workflow/Workflow";

export default class WorkflowTemplateRepository{
    
    async saveWorkflowTemplate(workflowTemplate: WorkflowTemplateProps): Promise<ObjectId>{
        try{
            const newWorkflowTemplate = new WorkflowTemplate(workflowTemplate);
            await newWorkflowTemplate.save();
            return newWorkflowTemplate._id;
        }
        catch(err){
            console.log(err);
            throw new ServerError("Could not save workflow information as template");
        }
    }

    async updateWorkflow(workflowTemplate): Promise<Boolean>{

        try {
            await WorkflowTemplate.updateOne({_id: workflowTemplate._id}, {
                templateName: workflowTemplate.templateName,
                templateOwnerId: workflowTemplate.templateOwnerId,
                templateOwnerEmail: workflowTemplate.templateOwnerEmail,
                workflowName: workflowTemplate.workflowName,
                workflowDescription: workflowTemplate.workflowDescription,
                documentPath: workflowTemplate.documentPath,
                phases: workflowTemplate.phases,
                documentName: workflowTemplate.documentName
        });
            return true;
        }
        catch(err){
            console.log("error updating the workflow template");
            console.log(err);
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async findWorkflowTemplate(templateId){
        try{
            return await WorkflowTemplate.findById(templateId);
        }
        catch(err){
            throw new ServerError("Could not find the specified workflow Template.");
        }
    }
}