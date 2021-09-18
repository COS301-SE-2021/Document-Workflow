import {Workflow, WorkflowProps} from "./Workflow";
import { ObjectId } from "mongoose";
import {ServerError} from "../error/Error";
import {logger} from "../LoggingConfig";

export default class WorkflowRepository{

    async saveWorkflow(workflow: WorkflowProps): Promise<ObjectId> {
        try {
            const newWorkflow = new Workflow(workflow);
            await newWorkflow.save();
            return newWorkflow._id;
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async updateWorkflow(workflow: WorkflowProps): Promise<Boolean>{
        console.log("Updating a workflow to have new values: ");
        console.log(workflow);
        try {
            await Workflow.updateOne({_id: workflow._id}, {
                name: workflow.name,
                ownerId: workflow.ownerId,
                ownerEmail: workflow.ownerEmail,
                documentId: workflow.documentId,
                description: workflow.description,
                phases: workflow.phases,
                currentPhase: workflow.currentPhase,
                status: workflow.status,
                hash: workflow.hash
            });
            return true;
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }


    async deleteWorkflow(id: ObjectId) {
        try {
            await Workflow.deleteOne({_id: id});
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async getWorkflow(id:string):Promise<WorkflowProps>{
        try{
            return await Workflow.findById(id);
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async addDocumentId(workflowId, documentId) {
        console.log("Adding documentID: ", documentId, " to workflow of id: ", workflowId);
        try {
            await Workflow.updateOne({_id: workflowId}, {$set: {documentId: documentId}}, {upsert: true});
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async addWorkflowHistoryId(workflowId, workflowHistoryId){
        logger.info("Saving the historyId: " + workflowHistoryId + " to workflow " + workflowId);
        try {
            await Workflow.updateOne({_id: workflowId}, {$set: {historyId: workflowHistoryId}}, {upsert: true});
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }
}