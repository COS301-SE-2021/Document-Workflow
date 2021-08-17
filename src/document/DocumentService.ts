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

    async updateDocument(file: File, id: ObjectId, phaseNumber){
        try{
            await this.documentRepository.updateDocumentS3(file, id, phaseNumber);
        }
        catch(err){
            console.log(err);
            throw(err);
        }
    }

    async deleteDocument(workflowId, documentId){
        console.log("Deleting document from CLoud server");
        await this.documentRepository.deleteDocumentFromS3(workflowId);
        console.log("deleting document from metadata database ", documentId);
        await this.documentRepository.deleteDocument(documentId);
    }

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
            return {metadata: metadata, filedata: filedata};
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

    async resetFirstPhaseDocument(workflowId, documentId) {
        const metadata = await this.documentRepository.getDocument(documentId);
        console.log("Resetting first phase document to original, path to original: ",workflowId + '/' + metadata.name);
        const originalDocument = await this.documentRepository.getDocumentFromS3(workflowId + '/' + metadata.name);
        await this.documentRepository.updateDocumentS3WithBuffer(workflowId +'/phase0/' + metadata.name, originalDocument.body);
        console.log(originalDocument);
    }
}

