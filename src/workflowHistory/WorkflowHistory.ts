import {createSchema, ExtractProps, Type, typedModel} from "ts-mongoose";

export const ENTRY_TYPE = Object.freeze({CREATE: "Create", EDIT:"Edit", REVERT: "Revert", ACCEPT:"Accept", REJECT:"Reject"});

export const Entry = createSchema({
    date: { type : Date, default: Date.now },
    userEmail: Type.string({required:true}),
    currentPhase: {type: Number, required: true},
    type: [ENTRY_TYPE]
},{_id: true, _v: false});

export const workflowHistorySchema = createSchema({
    entries: {type: [Entry], default: []}
},{_id: true, _v: false});

export const WorkflowHistory = typedModel('WorkflowHistory', workflowHistorySchema);
export type WorkflowHistoryProps = ExtractProps<typeof workflowHistorySchema>;