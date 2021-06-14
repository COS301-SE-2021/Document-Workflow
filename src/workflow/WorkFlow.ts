import mongoose from "mongoose";

export interface WorkflowI{

    _id: string,
    owner_id: string,
    owner_email: string,
    document_id: string,
    document_path: string,
}

const workflowSchema = new mongoose.Schema<WorkflowI>({

    owner_id: {type:String, required: true},
    owner_email: {type:String, required: true},
    document_id: {type:String, required:true},
    document_path: {type:String, required:true}
});

export default mongoose.model<WorkflowI>('Workflow', workflowSchema)