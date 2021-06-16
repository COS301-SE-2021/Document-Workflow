import mongoose from "mongoose";

export interface WorkFlowI{
    _id: string,
    name: string,
    owner_id: string,
    owner_email: string,
    document_id: string,
    document_path: string,
    members: [string]
}

const workflowSchema = new mongoose.Schema<WorkFlowI>({
    owner_id: {type:String},
    name: {type: String, required: true},
    owner_email: {type:String, required: true},
    document_id: {type:String},
    document_path: {type:String, required:true},
    members: {type: [String], required:true}
});

export default mongoose.model<WorkFlowI>('WorkFlow', workflowSchema)