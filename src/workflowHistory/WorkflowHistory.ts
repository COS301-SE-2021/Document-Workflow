import {createSchema, ExtractProps, Type, typedModel} from "ts-mongoose";

export const ENTRY_TYPE = Object.freeze({CREATE: "Create", EDIT:"Edit", REVERT: "Revert", ACCEPT:"Accept", REJECT:"Reject"});

export class Entry{
    date: number;
    userEmail: String;
    currentPhase: Number;
    type: string;
};

export const workflowHistorySchema = createSchema({
    entries: {type: [String], default: []}
},{_id: true, _v: false});

export const WorkflowHistory = typedModel('WorkflowHistory', workflowHistorySchema);
export type WorkflowHistoryProps = ExtractProps<typeof workflowHistorySchema>;