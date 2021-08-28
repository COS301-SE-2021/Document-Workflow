import { ObjectId } from "mongoose";
import {ServerError} from "../error/Error";
import {WorkflowHistoryProps, WorkflowHistory} from "./WorkflowHistory";

export default class WorkflowHistoryRepository{

    async saveWorkflowHistory(workflowHistory: WorkflowHistoryProps): Promise<ObjectId> {
        try {
            const newWorkflowHistory = new WorkflowHistory(workflowHistory);
            await newWorkflowHistory.save();
            return newWorkflowHistory._id;
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async getWorkflowHistory(id:string):Promise<WorkflowHistoryProps>{
        try{
            return await WorkflowHistory.findById(id);
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }
}