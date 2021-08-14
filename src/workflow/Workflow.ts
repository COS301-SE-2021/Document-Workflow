import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc, ExtractProps
} from "ts-mongoose";
import { phaseSchema } from "../phase/Phase";
import { userSchema } from "../user/User";
import { documentSchema } from "../document/Document";

export const WorkflowStatus = Object.freeze({COMPLETED: "Completed", INPROGRESS: "InProgress", REJECTED: "Rejected"});

//TODO: add the status variable
export const workflowSchema = createSchema({
    name: Type.string({required: true}),
    ownerId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    ownerEmail: Type.string({required: true}),
    documentId: Type.ref(Type.objectId({required: false})).to("Document", documentSchema),
    description: Type.string({required: true}),
    phases: Type.array({required: false}).of(Type.ref(Type.objectId({required: true})).to("Phase", phaseSchema)),
    currentPhase: Type.number({default: 0}),
    status: Type.string({default: WorkflowStatus.INPROGRESS})
}, {_id: true, _v: false});

export const Workflow = typedModel('WorkFlow', workflowSchema);
export type WorkflowProps = ExtractProps<typeof workflowSchema>;