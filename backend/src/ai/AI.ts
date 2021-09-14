import { Schema, model } from 'mongoose';
import { IAI } from "./IAI";


export const AISchema = new Schema<IAI>({
    jsonData: { type: String, required: true },
    creationDate: { type: Number, required: true },
    accuracy: { type: Number, required: true }
});

export const AI = model<IAI>("AIClassifier", AISchema);