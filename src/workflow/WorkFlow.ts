import { Document, Schema, model } from "mongoose";

export default interface WorkFlow extends Document{
    name: string,
    owner_id: string,
    owner_email: string,
    document_id: string,
    document_path: string,
    phases: [[string]]
}

const workflowSchema = new Schema<WorkFlow>({
    name: {type: String, required: true},
    owner_id: {type:String},
    owner_email: {type:String, required: true},
    document_id: {type:String},
    document_path: {type:String, required:true},
    phases: {type: [[String]], required:true}
});

workflowSchema.pre("save", async function(next) {

})

export const WorkFlowModel = model<WorkFlow>('WorkFlowModel', workflowSchema);