import { createSchema, ExtractDoc, Type, typedModel } from "ts-mongoose";
import { userSchema } from "../user/User";

export const ActionAreaType = ["Date","Signature", "initial"];
export const PhaseStatus = ["Pending", "InProgress", "Rejected", "Completed"];

const actionAreaSchema = createSchema({
    coordinates: Type.array({maxlength: 2, minlength: 2, required: true}).of(Type.number),
    type: Type.string({enum: ActionAreaType, required: true}),
    dimensions: Type.array({maxlength: 2, minlength: 2, required: true}).of(Type.number),
    content: Type.mixed()
}, { _id: false, _v: false });

const commentSchema = createSchema({
    userId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    content: Type.string({required: true})
}, { _id: false, _v: false });

export const phaseSchema = createSchema({
    users: Type.array({required: true}).of(Type.ref(Type.objectId()).to("User", userSchema)),
    comments: Type.array().of(commentSchema),
    description: Type.string({required: true}),
    actionAreas: Type.array().of(actionAreaSchema),
    signingUserId: Type.ref(Type.objectId({required:true})).to("User", userSchema),
    status: Type.string({enum: PhaseStatus, required: true})
}, { _id: false, _v: false });

export const Phase = typedModel('Phase', phaseSchema);
export type PhaseDoc = ExtractDoc<typeof phaseSchema>;

export const ActionArea = typedModel('ActionArea', actionAreaSchema);
export type ActionAreaDoc = ExtractDoc<typeof actionAreaSchema>;