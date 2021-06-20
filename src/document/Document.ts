import mongoose, { Schema, model } from 'mongoose';

export default interface Document extends mongoose.Document{
    workflow_id: string;
    doc_name: string;
    mimetype: string;
    encoding: string;
    size: string;
    document_path: string;
}

const documentSchema = new Schema<Document>({
    workflow_id: {type: String, required:true},
    doc_name: { type: String, required: true},
    mimetype: { type: String, required: true},
    encoding: {type: String, required: true},
    size: {type: Number, required: true},
    document_path: {type:String, required: true}
});

export const DocumentModel = model<Document>("Document", documentSchema);