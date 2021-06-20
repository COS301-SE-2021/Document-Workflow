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

    async getDocuments(): Promise<Document[]> {
        try {
            return await DocumentModel.find({});
        }
        catch(err) {
            throw new Error("Could not find Documents");
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
