import { Document, DocumentProps } from "./Document";
import * as AWS from 'aws-sdk';
import { ObjectId, Types } from "mongoose";
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

export default class DocumentRepository {

    async saveDocumentToS3() {
        const upload = multer({
            storage: multerS3({
                s3: s3,
                bucket: process.env.AWS_BUCKET_NAME,
                metadata: function (req, file, cb) {
                    cb(null, { fieldName: file.fieldname });
                },
                key: function (req, file, cb) {
                    cb(null, Date.now().toString())
                }
            })
        })

    }

    /*
       This function should only be used when creating a document when the workflow is created.
       To update a document/create a new phase in the S3 bucket see the 'putDocument' function
     */
    //TODO: when saving documents to s3, use promises instead of callbacks
    async postDocument(doc: DocumentProps, file): Promise<ObjectId> {
        console.log(file);
        try{
            const newDoc = new Document(doc);
            await newDoc.save();
        }
        catch(err) {
            console.log(err);
            throw new Error("Could not save Document data");
        }

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: doc.workflowId +"/"+ file.name
        }
        try{
            await s3.upload(uploadParams, (err, data) => {
                console.log(err)
                if(err) {
                    throw new Error("Error establishing connection to the cloud file server");
                }
                else console.log(data);

            });

        }
        catch(e){
            console.log(e);
        }

        const uploadParams2 = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: doc.workflowId +"/phase0/"+ file.name
        }

        await s3.upload(uploadParams2, (err, data) => {
            if(err) {
                throw new Error("Error establishing connection to the cloud file server");
            }
            else console.log(data);
        });

        return doc._id;
    }

    async updateDocumentS3(file, workflowId, phaseNumber){
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: workflowId +"/phase"+phaseNumber +"/" + file.name
        }
        try{
            console.log(uploadParams);
            let d = await s3.putObject(uploadParams).promise();
            console.log("Finished updating s3 file");
            console.log(d);
        }
        catch(e){
            console.log(e);
        }
    }

    async getDocument(id: Types.ObjectId): Promise<DocumentProps> {
        try {
            return await Document.findById(id);
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
