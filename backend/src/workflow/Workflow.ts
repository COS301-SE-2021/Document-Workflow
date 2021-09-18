import { model, Schema } from 'mongoose';
import { IWorkflow } from "./IWorkflow";

export const WorkflowStatus = Object.freeze({COMPLETED: "Completed", INPROGRESS: "InProgress", REJECTED: "Rejected"});

export const workflowSchema = new Schema<IWorkflow>({
    name: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerEmail: ({ type: String, required: true }),
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: false },
    historyId: { type: Schema.Types.ObjectId, ref: "Workflow", required: false },
    description: { type: String, required: true },
    phases: [{ type: String, required: false }],
    currentPhase: { type: Number , default: 0 },
    status: { type: String, default: WorkflowStatus.INPROGRESS, required: false },
    currentHash: { type: String, default: "", required: false }
});

export const Workflow = model<IWorkflow>('Workflow', workflowSchema);


