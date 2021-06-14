import Document, { DocumentI } from "./Document";
import AWS from 'aws-sdk';


const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_SECRET_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

const s3 = new AWS.S3();

export default class DocumentRepository {

    async postDocument(request): Promise<void> {
        const file = request.files.document;
        console.log("Creating the document metadata")
        let doc = null;
        try {
                doc = new Document({
                doc_name: file.name,
                mimetype: file.mimetype,
                encoding: file.encoding,
                size: file.size,
                aws_path: file.name  //TODO: change this path to start with the workflow id
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
            Bucket: bucketName,
            Body: file.data,
            Key: file.name
        }

        try {
            let res = await s3.upload(uploadParams)
            console.log(res);
        }
        catch(err)
        {throw "Error establishing connection to the cloud file server"}

    }

    async getDocument(key) : Promise<any>{

    }

    async getDocuments(filter): Promise<DocumentI[]> {
        try {
            return await Document.find(filter);
        } catch(err) {
            throw err;
        }
    }
}
