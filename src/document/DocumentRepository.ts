import Document, { DocumentI } from "./Document";
import * as AWS from 'aws-sdk';


const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

export default class DocumentRepository {


    /**
     *
     * @param document
     * @param workflow_id
     */
    async postDocument(document, workflow_id): Promise<void> {
        const file = document;
        console.log("Creating the document metadata")
        let doc = null;
        try {
                doc = new Document({
                workflow_id: workflow_id,
                doc_name: file.name,
                mimetype: file.mimetype,
                encoding: file.encoding,
                size: file.size,
                document_path: workflow_id + '/' + file.name
            });
        }
        catch(err) {
            console.log(err)
            throw err;
        }

        console.log("Saving the document metadata");
        try{
            await doc.save();
        } catch (err) {
            throw "Could not access database";
        }

        console.log("Uploading the file to AWS")
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: workflow_id +"/"+ file.name
        }

        console.log(uploadParams);
        await s3.upload(uploadParams, (err, data) =>{
            if(err)
            {
                console.log(err)
                throw "Error establishing connection to the cloud file server";
            }
            else console.log(data);

        });
        return doc._id;
    }

    async updateDocumentS3(documentMetaData, file) : Promise<any>{
        console.log("Updating file in AWS S3")

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: documentMetaData.document_path
        }
        console.log(uploadParams);
        let d = await s3.putObject(uploadParams).promise();
        console.log("Finished updating s3 file");
        console.log(d);
        return "";
    }

    async getDocument(key) : Promise<any>{
        try{
            return await Document.findById(key);
        }
        catch(err){
            throw "The specified document Id could not be found";
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

    async getDocuments(filter): Promise<DocumentI[]> {
        try {
            return await Document.find(filter);
        } catch(err) {
            throw err;
        }
    }
}
