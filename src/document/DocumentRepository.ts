import Document, { DocumentModel } from "./Document";
import * as AWS from 'aws-sdk';
import { Types } from "mongoose";

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

export default class DocumentRepository {

    async postDocument(doc: Document, file: File): Promise<Document> {
        try{
            const newDoc = new DocumentModel(doc);
            await newDoc.save();
        }
        catch(err) {
            throw new Error("Could not save Document data");
        }

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file,
            Key: doc.workflow_id +"/"+ file.name
        }

        s3.upload(uploadParams, (err, data) => {
            if(err) {
                throw new Error("Error establishing connection to the cloud file server");
            }
            else console.log(data);

        });
        return doc;
    }

    async getDocument(id: Types.ObjectId): Promise<Document> {
        try {
            return await DocumentModel.findOne(id);
        }
        catch(err){
            throw new Error("Could not find Document");
        }
    }

    async getDocuments(): Promise<Document[]> {
        try {
            return await DocumentModel.find({});
        }
        catch(err) {
            throw new Error("Could not find Documents");
        }
    }
}
