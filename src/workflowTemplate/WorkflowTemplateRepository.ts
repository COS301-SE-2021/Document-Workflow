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

    async findWorkflowTemplate(templateId){
        try{
            return await WorkflowTemplate.findById(templateId);
        }
        catch(err){
            throw new ServerError("Could not find the specified workflow Template.");
        }
    }

    async deleteWorkflowTemplate(id: ObjectId) {
        try {
            await WorkflowTemplate.deleteOne({_id: id});
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }
}