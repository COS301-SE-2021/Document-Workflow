import { Document } from "./Document";
import * as AWS from 'aws-sdk';
import { Types } from "mongoose";
import { CloudError, DatabaseError, ServerError } from "../error/Error";
import { IDocument } from "./IDocument";
type ObjectId = Types.ObjectId;

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID

    // accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    // region: process.env.BUCKETEER_AWS_REGION
});

export default class DocumentRepository {

    async saveDocumentToS3(file, path) {
        console.log("Testing new save file to S3 function");
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: path
        }
        try {
            await s3.upload(uploadParams, (err, data) => {
                console.log(err)
                if(err) {
                    throw new CloudError("The cloud server could not be reached at this time, please try again later.");
                }
                else console.log(data);

            });
        }
        catch(e){
            throw new CloudError("The cloud server could not be reached at this time, please try again later.");
        }
    }

    /*
       This function should only be used when creating a document when the workflow is created.
       To update a document/create a new phase in the S3 bucket see the 'putDocument' function
     */
    async saveDocument(doc: IDocument, fileData: Buffer, fileName: String): Promise<ObjectId> {
        let response: IDocument = null;
        try{
            const newDoc = new Document(doc);
            response = await newDoc.save();
        }
        catch(err) {
            throw new DatabaseError("Could not save Document data");
        }
        let uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: fileData,
            Key: 'workflows/' + doc.workflowId +"/phase0/"+ fileName
        }

        try{
            await s3.upload(uploadParams, (err, data) => {
                console.log(err)
                if(err) {
                    throw new CloudError("The cloud server could not be reached at this time, please try again later.");
                }
                else console.log(data);
            });
        }
        catch(e){
            throw new ServerError("The cloud server could not be reached");
        }

        uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: fileData,
            Key: 'workflows/' + doc.workflowId +"/"+ fileName
        }
        try{
            await s3.upload(uploadParams, (err, data) => {
                console.log(err)
                if(err) {
                    throw new CloudError("The cloud server could not be reached at this time, please try again later.");
                }
                else console.log(data);
            });
        }
        catch(e){
            throw new ServerError("The cloud server could not be reached");
        }
        return response._id;
    }

    async updateDocumentS3(file, workflowId, phaseNumber){
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: 'workflows/' + workflowId + "/phase" +phaseNumber +"/" + file.name
        }
        try{
            let d = await s3.putObject(uploadParams).promise();
        }
        catch(e){
            throw new ServerError("The cloud server could not be reached");
        }
    }

    async getDocument(id: Types.ObjectId): Promise<IDocument> {
        try {
            return await Document.findById(id);
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async getDocumentFromS3(path):Promise<any>{
        try{
            return await s3.getObject({Bucket: process.env.AWS_BUCKET_NAME, Key:path}).promise();
        }
        catch(err){
            throw new CloudError("Something went wrong when trying to download from s3, message: " + err.message);
        }
    }

    async deleteDocument(id){
        try {
            const doc = await Document.findById(id);
            if(!doc === null)
                await Document.deleteOne({_id: id});
        }
        catch(err){
            throw new ServerError("Something went wrong when trying to delete meta data from mongo, message: " + err.message);
        }
    }

    async getDocuments(): Promise<IDocument[]> {
        try {
            return await Document.find();
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    /**
     * This function exists due to the way in which AWS returns files. It returns buffers that can be converted
     * into files using fs (and possibly even new file). Our original function for updating a file in S3
     * takes in a file object, and extracts the data from it anyway (that is to say, it takes the array buffer of data
     * from the file and uses that in its request to aws). To save time when we have access to a filebuffer and not a file
     * object, we create this function that instead takes the buffer in directly.
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
            let d = await s3.putObject(uploadParams).promise();
        }
        catch(e){
            throw new CloudError("Could not update s3, message: " + e.message);
        }
    }

    async deleteDocumentFromS3(folderName){
        try {
            const listParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Prefix: 'workflows/' + String(folderName)
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

            if (listedObjects.IsTruncated) await this.deleteDocument(folderName);
        }
        catch(err){
            throw new CloudError("Something went wrong when trying to delete from s3 message: " + err.message);
        }
    }
}
