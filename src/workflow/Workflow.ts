import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc, ExtractProps
} from "ts-mongoose";
import { phaseSchema } from "../phase/Phase";
import { userSchema } from "../user/User";
import { documentSchema } from "../document/Document";

//TODO: add current phase index number
export const workflowSchema = createSchema({
    name: Type.string({required: true}),
    ownerId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    documentId: Type.ref(Type.objectId({required: false})).to("Document", documentSchema),
    description: Type.string({required: true}),
    phases: Type.array({required: false}).of(Type.ref(Type.objectId({required: true})).to("Phase", phaseSchema))
}, {_id: true, _v: false});

export const Workflow = typedModel('WorkFlowModel', workflowSchema);
export type WorkflowProps = ExtractProps<typeof workflowSchema>;