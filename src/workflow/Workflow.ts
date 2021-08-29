import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc, ExtractProps
} from "ts-mongoose";
import { phaseSchema } from "../phase/Phase";
import { userSchema } from "../user/User";
import { documentSchema } from "../document/Document";
import {workflowHistorySchema} from "../workflowHistory/WorkflowHistory";

export const WorkflowStatus = Object.freeze({COMPLETED: "Completed", INPROGRESS: "InProgress", REJECTED: "Rejected"});

export const workflowSchema = createSchema({
    name: Type.string({required: true}),
    ownerId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    ownerEmail: Type.string({required: true}),
    documentId: Type.ref(Type.objectId({required: false})).to("Document", documentSchema),
    historyId: Type.ref(Type.objectId({required: false})).to("WorkflowHistory", workflowHistorySchema),
    description: Type.string({required: true}),
    phases: [{type:String}],
    currentPhase: Type.number({default: 0}),
    status: Type.string({default: WorkflowStatus.INPROGRESS}),

}, {_id: true, _v: false});



export const Workflow = typedModel('WorkFlow', workflowSchema);
export type WorkflowProps = ExtractProps<typeof workflowSchema>;


