import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc, ExtractProps
} from "ts-mongoose";
import { userSchema } from "../user/User";

/**
 * Document
 */
export const workflowTemplateSchema= createSchema({
    templateName: Type.string({required: true}),
    templateOwnerId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    templateOwnerEmail: Type.string({required: true}),
    workflowName: Type.string({required:true}),
    workflowDescription: Type.string({required: true}),
    phases: Type.array({required:true}).of(Type.string),
    documentName: Type.string({required: true})
},{_id: true, _v: false});

export const WorkflowTemplate = typedModel('WorkflowModel', workflowTemplateSchema);
export type WorkflowTemplateProps = ExtractProps<typeof workflowTemplateSchema>;

