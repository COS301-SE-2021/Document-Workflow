import {
    createSchema,
    Type,
    typedModel,
    ExtractProps
} from "ts-mongoose";
import { workflowSchema } from "../workflow/Workflow";

export const documentSchema = createSchema({
    name: Type.string({required: true}),
    size: Type.number({required: true}),
    path: Type.string({required: true}),
    workflowId: Type.ref(Type.objectId({required: true})).to("Workflow", workflowSchema)
});

export const Document = typedModel("Document", documentSchema);
export type DocumentProps = ExtractProps<typeof documentSchema>;