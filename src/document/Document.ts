import { Schema, model } from 'mongoose';

export interface DocumentI {
    doc_name: string;
    mimetype: string;
    encoding: string;
    size: string;
    aws_path: string;
}

const documentSchema = new Schema<DocumentI>({
    doc_name: { type: String, required: true},
    mimetype: { type: String, required: true },
    encoding: {type: String, required: true},
    size: {type: Number, required: true},
    aws_path: {type:String, required: true}
});

export default model<DocumentI>("Document", documentSchema);