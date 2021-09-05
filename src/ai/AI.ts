import {
    createSchema,
    Type,
    typedModel,
    ExtractProps
} from "ts-mongoose";


export const AISchema = createSchema({
    jsonData: Type.string({required: true}),
    creationDate: Type.number({required: true}),
    accuracy: Type.number({required: true})
});

export const AI= typedModel("AIClassifier", AISchema);
export type AIProps = ExtractProps<typeof AISchema>;