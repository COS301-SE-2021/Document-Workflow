import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc
} from "ts-mongoose";
import { phaseSchema } from "./Phase";
import { userSchema } from "../user/User";
import { documentSchema } from "../document/Document";

const workflowSchema = createSchema({
    name: Type.string({required: true}),
    ownerId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    documentId: Type.ref(Type.objectId({required: true})).to("Document", documentSchema),
    description: Type.string({required: true}),
    phases: Type.array({required: true}).of(phaseSchema)
});

export const WorkFlowModel = typedModel('WorkFlowModel', workflowSchema);
export type Workflow = ExtractDoc<typeof workflowSchema>;