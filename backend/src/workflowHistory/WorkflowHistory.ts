import { Schema, model } from 'mongoose';
import { IWorkflowHistory } from "./IWorkflowHistory";

export const ENTRY_TYPE = Object.freeze({CREATE: "Create", SIGN:"Sign", REVERT: "Revert", ACCEPT:"Accept", REJECT:"Reject", EDIT:"Edit"});

export class Entry{
    hash: string;
    date: number;
    userEmail: string;
    currentPhase: Number;
    type: string;
}
export const workflowHistorySchema = new Schema<IWorkflowHistory>({
    entries: [{type: String}]
})

export const WorkflowHistory = model<IWorkflowHistory>('WorkflowHistory', workflowHistorySchema);