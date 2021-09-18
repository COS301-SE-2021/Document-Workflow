import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { WorkflowHistory } from "./WorkflowHistory";
import { IWorkflowHistory } from "./IWorkflowHistory";
import {User} from "../user/User";
import {IWorkflow} from "../workflow/IWorkflow";
import {Workflow} from "../workflow/Workflow";
type ObjectId = Types.ObjectId;

export default class WorkflowHistoryRepository{

    async saveWorkflowHistory(workflowHistory: IWorkflowHistory): Promise<ObjectId> {
        try {
            const newWorkflowHistory = new WorkflowHistory(workflowHistory);
            await newWorkflowHistory.save();
            return newWorkflowHistory._id;
        }
        catch(err){
            console.log(err);
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async updateWorkflowHistory(workflowHistory: IWorkflowHistory){
        try{
            return await WorkflowHistory.updateOne({_id: workflowHistory._id}, workflowHistory).lean();
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async getWorkflowHistory(id: string): Promise<IWorkflowHistory>{
        try{
            return await WorkflowHistory.findById(id).lean();
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async deleteWorkflowHistory(id: ObjectId): Promise<ObjectId> {
        try {
            const response: IWorkflow = await WorkflowHistory.deleteOne({_id: id}).lean();
            if(response) return response._id;
            else return null;
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

}