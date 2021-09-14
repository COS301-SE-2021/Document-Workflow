import { Schema, model } from 'mongoose';
import { userSchema } from "../user/User";
import { IWorkflowTemplate } from "./IWorkflowTemplate";

/**
 * Document
 */
export const workflowTemplateSchema= new Schema<IWorkflowTemplate>({
    templateName: { type: String, required: true},
    templateDescription: { type: String, required: true},
    templateOwnerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    templateOwnerEmail: { type: String, required: true},
    workflowName: { type: String, required: true},
    workflowDescription:{ type: String, required: true},
    phases: [{ type: String, required: true}],
    documentName: { type: String, required: true}
});

export const WorkflowTemplate = model<IWorkflowTemplate>('WorkflowModel', workflowTemplateSchema);

