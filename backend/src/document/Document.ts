import { Schema, model } from 'mongoose';
import { workflowSchema } from "../workflow/Workflow";
import { IDocument } from "./IDocument";

export const documentSchema = new Schema<IDocument>({
    name: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    workflowId: { type: Schema.Types.ObjectId , ref: "Workflow" , required: true }
});

export const Document = model<IDocument>("Document", documentSchema);