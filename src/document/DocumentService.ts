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
                path: id + '/' +file.name,
                workflowId: id
            })
            return await this.documentRepository.postDocument(doc, file);
        }
        catch(err) {
            console.log(err);
            throw new RequestError("Could not store document");
        }
    }

    async putDocument(file: File, id: ObjectId, phaseNumber){
        try{
            await this.documentRepository.putDocumentS3(file, id, phaseNumber);
        }
        catch(err){
            console.log(err);
            throw(err);
        }
    }

    async deleteDocument(workflow_id, document_id){
        console.log("Deleting document from CLoud server");
        await this.documentRepository.deleteDocumentFromS3(workflow_id);
        console.log("deleting document from metadata database ", document_id);
        await this.documentRepository.deleteDocument(document_id);
    }

    //TODO: update this!! fetch documents based on their phase.
    async retrieveDocument(docId, workflowId, currentPhase) : Promise<any> {
        console.log("retrieving a document");
        console.log(docId);
        try {
            const metadata = await this.documentRepository.getDocument(docId);
            console.log(metadata);
            console.log("Fetching document from S3 server with path: ", workflowId +'/phase' + currentPhase +'/', metadata.name);
            const filedata = await this.documentRepository.getDocumentFromS3(workflowId +'/phase' + currentPhase +'/' + metadata.name);
            if(filedata === null)
                throw "The specified document does not exist.";
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

