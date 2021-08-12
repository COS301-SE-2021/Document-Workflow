import { injectable } from "tsyringe";
import DocumentRepository from "./DocumentRepository";
import { Document, DocumentProps } from "./Document";
import { RequestError } from "../error/Error";
import fs from 'fs';
import { ObjectId } from "mongoose";

@injectable()
export default class DocumentService {

    constructor(private documentRepository: DocumentRepository) {}

    async getDocuments(): Promise<DocumentProps[]> {
        try{
            return await this.documentRepository.getDocuments();
        }catch(err){
            throw new RequestError("Could not retrieve documents");
        }
    }

    //TODO: Check if type is PDF
    async uploadDocument(file: File, id: ObjectId): Promise<ObjectId>{
        try{
            const doc = new Document({
                name: file.name,
                size: file.size,
                path: file.name + '/',
                workflowId: id
            })
            return await this.documentRepository.postDocument(doc, file);
        }
        catch(err) {
            throw new RequestError("Could not store document");
        }
    }

    async deleteDocument(workflow_id, document_id){
        console.log("Deleting document from CLoud server");
        await this.documentRepository.deleteDocumentFromS3(workflow_id);
        console.log("deleting document from metadata database ", document_id);
        await this.documentRepository.deleteDocument(document_id);
    }

    async retrieveDocument(req) : Promise<any> {
        console.log("retrieving a document");
        console.log(req.body.doc_id);
        try {
            const metadata = await this.documentRepository.getDocument(req.body.doc_id);
            console.log(metadata);
            console.log(metadata.document_path);
            const filedata = await this.documentRepository.getDocumentFromS3(metadata.document_path);
            if(filedata === null)
                throw "The specified document does not exist.";
            //await this.turnBufferIntoFile(filedata,metadata);
            console.log({status:"success", data:{metadata: metadata, filedata: filedata}, message:"" });
            return {status:"success", data:{metadata: metadata, filedata: filedata}, message:"" };
            //return {status:"success", data:{filepath: metadata.doc_name}, message:"" }; //need to return filepath ( which is just the file name) up the chain so we can pipe it to the response.
        }
        catch(err)
        {
            console.log(err);
            throw err;
        }
    }

    async turnBufferIntoFile(filedata, metadata): Promise<any>{
        console.log("Turning retrieved buffer into a file")
        const buf = Buffer.from(filedata.Body);

        fs.open(metadata.doc_name, 'w', (err,fd)=>{
            if(err)
                throw 'Error retrieving the file';
            fs.write(fd, buf, 0, buf.length, null, function(err) {
                if (err) {
                    throw 'Error retrieving the file';
                }
                fs.close(fd, function() {
                    console.log('file written successfully');
                });
            });
        });
    }
}

