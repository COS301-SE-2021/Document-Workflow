import Document, { DocumentI } from "./Document";
import * as AWS from 'aws-sdk';


const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
});

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
        /*
        console.log("Saving the document metadata");
        try{
            await doc.save();
        } catch (err) {
            throw "Could not access database";
        }*/
        console.log("Uploading the file to AWS")
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: file.data,
            Key: file.name
        }

        console.log(uploadParams);
        s3.upload(uploadParams, (err, data) =>{
            if(err)
            {
                console.log(err)
                throw "Error establishing connection to the cloud file server";
            }
            else console.log(data);

        });
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
