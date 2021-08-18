import { createSchema, ExtractDoc, ExtractProps, Type, typedModel } from "ts-mongoose";
import { userSchema } from "../user/User";

//export const ActionAreaType = ["Date","Signature", "initial"];
export const PhaseStatus = Object.freeze({PENDING:"Pending", INPROGRESS:"InProgress", REJECTED:"Rejected", COMPLETED:"Completed", CREATE: "Create", DELETE: "Delete", EDIT:"Edit"});

/*const actionAreaSchema = createSchema({ //sort of scrapped
    coordinates: Type.array({maxlength: 2, minlength: 2, required: true}).of(Type.number),
    type: Type.string({enum: ActionAreaType, required: true}),
    dimensions: Type.array({maxlength: 2, minlength: 2, required: true}).of(Type.number),
    content: Type.mixed()
}, { _id: false, _v: false });

const commentSchema = createSchema({ //sort of scrapped
    userId: Type.ref(Type.objectId({required: true})).to("User", userSchema),
    content: Type.string({required: true})
}, { _id: false, _v: false });*/

export const phaseSchema = createSchema({
    users: String,
    //comments: Type.array().of(commentSchema),
    annotations: Type.string({required: true}),
    description: Type.string({required: true}),
    //actionAreas: Type.array().of(actionAreaSchema), //annotations: string -> includes comments
    //signingUserId: Type.ref(Type.objectId({required:true})).to("User", userSchema),
    status: Type.string({ required: true, default: PhaseStatus.PENDING}),
    //userAccepts: Type.string({required: true})
}, { _id: true, _v: false });

export const Phase = typedModel('Phase', phaseSchema);
export type PhaseProps = ExtractProps<typeof phaseSchema>;

/*export const ActionArea = typedModel('ActionArea', actionAreaSchema);
export type ActionAreaProps = ExtractProps<typeof actionAreaSchema>;*/