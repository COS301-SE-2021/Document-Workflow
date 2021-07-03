import { Schema, model } from "mongoose";

export interface WorkFlowI{

    _id: string,
    name: string,
    owner_email: string,
    document_id: string,
    document_path: string,
    description: string,
    phases: [[string]]
}

const workflowSchema = new Schema<WorkFlowI>({

    name: {type: String, required: true},
    description: {type: String, default:""},
    owner_email: {type:String, required: true},
    document_id: {type:String},
    document_path: {type:String, required:true},
    phases: {type: [[String]], required:true}
});

export default model<WorkFlowI>('WorkFlow', workflowSchema)