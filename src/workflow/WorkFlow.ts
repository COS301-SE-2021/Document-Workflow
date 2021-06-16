import mongoose from "mongoose";

export interface WorkFlowI{

    _id: string,
    name: string,
    owner_email: string,
    document_id: string,
    document_path: string,
    description: string,
    members: [string]
}

const workflowSchema = new mongoose.Schema<WorkFlowI>({

    name: {type: String, required: true},
    description: {type: String, default:""},
    owner_email: {type:String, required: true},
    document_id: {type:String},
    document_path: {type:String, required:true},
    members: {type: [String], required:true}
});

export default mongoose.model<WorkFlowI>('WorkFlow', workflowSchema)