import { WorkflowTemplate } from "./WorkflowTemplate";
import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { IWorkflowTemplate } from "./IWorkflowTemplate";
type ObjectId = Types.ObjectId;

export default class WorkflowTemplateRepository{

    async saveWorkflowTemplate(workflowTemplate: IWorkflowTemplate): Promise<ObjectId>{
        try{
            const newWorkflowTemplate = new WorkflowTemplate(workflowTemplate);
            const response: IWorkflowTemplate = await newWorkflowTemplate.save();
            if(response) return response._id;
            else return null;
        }
        catch(err){
            throw new DatabaseError("Could not save workflow information as template");
        }
    }

    async findWorkflowTemplate(templateId): Promise<IWorkflowTemplate>{
        try{
            return await WorkflowTemplate.findById(templateId).lean();
        }
        catch(err){
            throw new DatabaseError("Could not find the specified workflow Template.");
        }
    }

    async deleteWorkflowTemplate(id: ObjectId) {
        try {
            await WorkflowTemplate.deleteOne({_id: id});
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }
}