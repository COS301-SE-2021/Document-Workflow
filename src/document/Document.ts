import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc
} from "ts-mongoose";

export const documentSchema = createSchema({
    name: Type.string({required: true}),
    size: Type.number({required: true}),
    path: Type.string({required: true}),
    version: Type.string({required: true}),
});

export const Document = typedModel("Document", documentSchema);
export type DocumentDoc = ExtractDoc<typeof documentSchema>;