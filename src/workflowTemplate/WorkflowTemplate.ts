import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc, ExtractProps
} from "ts-mongoose";
import { userSchema } from "../user/User";

export const workflowTemplateSchema= createSchema({
    templateName: Type.string({required: true}),
    templateOwnerId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    templateOwnerEmail: Type.string({required: true}),
    workflowName: Type.string({required:true}),
    workflowDescription: Type.string({required: true}),
    documentPath: Type.string({default:""}),
    phases: Type.array({required:true}).of(Type.string)
},{_id: true, _v: false});

export const WorkflowTemplate = typedModel('WorkflowModel', workflowTemplateSchema);
export type WorkflowTemplateProps = ExtractProps<typeof workflowTemplateSchema>;

