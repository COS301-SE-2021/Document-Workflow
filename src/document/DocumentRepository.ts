import { Document, DocumentProps } from "./Document";
import * as AWS from 'aws-sdk';
import { ObjectId, Types } from "mongoose";
import { CloudError, DatabaseError, ServerError } from "../error/Error";
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

export default class DocumentRepository {

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

    async updateDocumentS3(file, workflowId, phaseNumber){
        console.log("Updating a document in S3, file looks as follows: ");
        console.log(file);
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
            throw new ServerError("The cloud server could not be reached");
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

    /**
     * This function exists due to the way in which AWS returns files. It returns buffers that can be converted
     * into files using fs (and possibly even new file). Our original function for updating a file in S3
     * takes in a file object, and extracts the data from it anyway (that is to say, it takes the array buffer of data
     * from the file and uses that in its request to aws). To save time when we have access to a filebuffer and not a file
     * object, we create this function that instead takes the buffer in directly.
     * TODO: change the update files3 function to take in filedata instead of a file, then we can destroy this function.
     * @param path
     * @param fileData
     */
    async updateDocumentS3WithBuffer(path, fileData){
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: fileData,
            Key: path
        }
        try{
            console.log(uploadParams);
            let d = await s3.putObject(uploadParams).promise();
            console.log("Finished updating s3 file");
            console.log(d);
        }
        catch(e){
            console.log(e);
            throw new ServerError("The cloud server could not be reached");
        }
    }

    async deleteDocumentFromS3(workflowId){ //workflowId is the folder name
        try {
            const listParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Prefix: workflowId
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

            if (listedObjects.IsTruncated) await this.deleteDocument(workflowId);
        }
        catch(err){
            throw "Could not delete document from File Server";
        }
    }
}
