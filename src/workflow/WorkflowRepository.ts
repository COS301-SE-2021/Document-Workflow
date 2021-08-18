import {Workflow, WorkflowProps} from "./Workflow";
import { ObjectId } from "mongoose";

export default class WorkflowRepository{

    async saveWorkflow(workflow: WorkflowProps): Promise<ObjectId> {
        const newWorkflow = new Workflow(workflow);
        await newWorkflow.save();
        return newWorkflow._id;
    }
    //This function does not work as intended. the updateOne function should take in the values to update eg {name: 'John Snow'}. See https://masteringjs.io/tutorials/mongoose/update

    async updateWorkflow(workflow: WorkflowProps): Promise<Boolean>{
        console.log("Updating a workflow to have new values: ");
        console.log(workflow);
        await Workflow.updateOne({_id: workflow._id}, {name: workflow.name,
            ownerId: workflow.ownerId,
            ownerEmail: workflow.ownerEmail,
            documentId: workflow.documentId,
            description: workflow.description,
            phases: workflow.phases,
            currentPhase: workflow.currentPhase,
            status: workflow.status
        });
        return true;
    }


    async deleteWorkflow(id: ObjectId) {
        await Workflow.deleteOne({_id: id});
    }

    async getWorkflow(id:string):Promise<WorkflowProps>{
        try{
            return await Workflow.findById(id);
        }
        catch(err){
            throw err;
        }
    }

    async addDocumentId(workflowId, documentId){
        console.log("Adding documentID: ", documentId, " to workflow of id: ", workflowId);
        await Workflow.updateOne({_id: workflowId}, {$set: {documentId: documentId}}, {upsert: true});
    }
}