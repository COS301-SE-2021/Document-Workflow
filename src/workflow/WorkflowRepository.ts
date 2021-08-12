import {Workflow, WorkflowProps} from "./Workflow";
import { ObjectId } from "mongoose";

export default class WorkflowRepository{

    async saveWorkflow(workflow: WorkflowProps): Promise<ObjectId> {
        const newWorkflow = new Workflow(workflow);
        await newWorkflow.save();
        return newWorkflow._id;
    }

    async updateWorkflow(workflow: WorkflowProps): Promise<Boolean>{
        const updated_workflow = await Workflow.updateOne({_id:workflow._id},workflow);
        return !!updated_workflow;
    }

    /*async deleteWorkflow(id: ObjectId): Promise<ObjectId> {
        return Workflow.deleteOne({_id: id});
    }*/

    /*async findWorkflow(id:string):Promise<WorkflowProps>{
        try{
            return await Workflow.findById(id).populateTs()
        }
        catch(err){
            throw err;
        }
    }*/

}