import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { WorkflowHistory } from "./WorkflowHistory";
import { IWorkflowHistory } from "./IWorkflowHistory";
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

    async getWorkflowHistory(id: string): Promise<IWorkflowHistory>{
        try{
            return await WorkflowHistory.findById(id).lean();
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

}