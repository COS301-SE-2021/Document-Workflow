import { createSchema, ExtractProps, Type, typedModel } from "ts-mongoose";

export const PhaseStatus = Object.freeze({PENDING:"Pending", INPROGRESS:"InProgress", REJECTED:"Rejected", COMPLETED:"Completed", CREATE: "Create", DELETE: "Delete", EDIT:"Edit"});

export const phaseSchema = createSchema({
    users: String,
    annotations: Type.string({required: true}),
    description: Type.string({required: true}),
    status: Type.string({ required: true, default: PhaseStatus.PENDING}),
}, { _id: true, _v: false });

export const Phase = typedModel('Phase', phaseSchema);
export type PhaseProps = ExtractProps<typeof phaseSchema>;