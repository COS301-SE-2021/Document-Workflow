import { Document, DocumentProps } from "./Document";
import * as AWS from 'aws-sdk';
import { ObjectId, Types } from "mongoose";
import { CloudError, DatabaseError } from "../error/Error";

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

export default class DocumentRepository {

    async saveDocument(doc: DocumentProps, fileData: Buffer, fileName: string): Promise<ObjectId> {
        try{
            const newDoc = new Document(doc);
            await newDoc.save();
        }
        catch(err) {
            throw new DatabaseError("Could not save Document data");
        }

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: fileData,
            Key: doc.workflowId +"/"+ fileName
        }

        s3.upload(uploadParams, (err, data) => {
            if(err) {
                throw new CloudError(err.toString());
            }
            else console.log(data);

        });
        return doc._id;
    }

    async getDocument(id: Types.ObjectId): Promise<DocumentProps> {
        try {
            return await Document.findOne(id);
        }
        catch(err){
            throw new Error("Could not find Document");
        }
    }

    async getDocumentFromS3(path):Promise<any>{
        try{
            return await s3.getObject({Bucket: process.env.AWS_BUCKET_NAME, Key:path}).promise();
        }
        catch(err){
            throw "The document server could not be reached";
        }
    }

    async deleteDocument(id){
        try {
            const doc = await Document.findById(id);
            if(!doc === null)
                await Document.deleteOne({_id: id});
        }
        catch(err){
            throw 'Could not delete fileMetadata';
        }
    }

    async getDocuments(): Promise<DocumentProps[]> {
        try {
            return await Document.find();
        }
        catch(err) {
            throw new Error("Could not find Documents " + err.toString());
        }
    }

    async deleteDocumentFromS3(workflow_id){ //workflow_id is the folder name
        try {
            const listParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Prefix: workflow_id
            };

            const listedObjects = await s3.listObjectsV2(listParams).promise();

            if (listedObjects.Contents.length === 0) return;

            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Delete: { Objects: [] }
            };

            listedObjects.Contents.forEach(({ Key }) => {
                deleteParams.Delete.Objects.push({ Key });
            });

            await s3.deleteObjects(deleteParams).promise();

            if (listedObjects.IsTruncated) await this.deleteDocument(workflow_id);
        }
        catch(err){
            throw "Could not delete document from File Server";
        }
    }
}
