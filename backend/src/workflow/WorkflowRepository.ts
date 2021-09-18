import { Workflow } from "./Workflow";
import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { logger } from "../LoggingConfig";
import { IWorkflow } from "./IWorkflow";
type ObjectId = Types.ObjectId;

export default class WorkflowRepository{

    async saveWorkflow(workflow: IWorkflow): Promise<IWorkflow> {
        try {
            const newWorkflow = new Workflow(workflow);
            const response: IWorkflow = await newWorkflow.save();
            if(response)
                return response;
            else return null;
        }
        catch(err){
            throw new DatabaseError("Something went wrong when trying to save the workflow Message: " + err.message);
        }
    }

    async updateWorkflow(workflow: IWorkflow): Promise<Boolean>{
        console.log("Updating a workflow to have new values: ");
        console.log(workflow);
        try {
            const response: IWorkflow = await Workflow.updateOne({_id: workflow._id}, workflow).lean();
            return !!response;
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }


    async deleteWorkflow(id: ObjectId): Promise<ObjectId> {
        try {
            const response: IWorkflow = await Workflow.deleteOne({_id: id}).lean();
            if(response) return response._id;
            else return null;
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async getWorkflow(id: string): Promise<IWorkflow>{
        try{
            const response: IWorkflow = await Workflow.findById(id).lean();
            if(response) return response;
            else return null;
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    //legacy
    async addDocumentId(workflowId, documentId) {
        console.log("Adding documentID: ", documentId, " to workflow of id: ", workflowId);
        try {
            await Workflow.updateOne({_id: workflowId}, {$set: {documentId: documentId}}, {upsert: true});
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    //legacy
    async addWorkflowHistoryId(workflowId, workflowHistoryId){
        logger.info("Saving the historyId: " + workflowHistoryId + " to workflow " + workflowId);
        try {
            await Workflow.updateOne({_id: workflowId}, {$set: {historyId: workflowHistoryId}}, {upsert: true});
        }
        catch(err){
            throw new DatabaseError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }
}