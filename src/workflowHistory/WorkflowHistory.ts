import {createSchema, ExtractProps, Type, typedModel} from "ts-mongoose";
import {documentSchema} from "../document/Document";
import {workflowSchema} from "../workflow/Workflow";

export const ENTRY_TYPE = Object.freeze({CREATE: "Create", SIGN:"Sign", REVERT: "Revert", ACCEPT:"Accept", REJECT:"Reject", EDIT:"Edit"});

export class Entry{
    hash: String;
    date: number;
    userEmail: String;
    currentPhase: Number;
    type: string;
};

export const workflowHistorySchema = createSchema({
    entries: [String],
},{_id: true, _v: false});

export const WorkflowHistory = typedModel('WorkflowHistory', workflowHistorySchema);
export type WorkflowHistoryProps = ExtractProps<typeof workflowHistorySchema>;