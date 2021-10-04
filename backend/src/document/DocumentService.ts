import { injectable } from "tsyringe";
import DocumentRepository from "./DocumentRepository";
import { Document } from "./Document";
import {RequestError, ServerError} from "../error/Error";
import fs from 'fs';
import { Types } from "mongoose";
import { IDocument } from "./IDocument";
type ObjectId = Types.ObjectId;

@injectable()
export default class DocumentService {

    constructor(private documentRepository: DocumentRepository) {}

    async getDocuments(): Promise<IDocument[]> {
        try{
            return await this.documentRepository.getDocuments();
        }catch(err){
            throw new RequestError("Could not retrieve documents");
        }
    }

    async uploadTemplateDocumentToCloud(file: File, workflowTemplateId){
        await this.documentRepository.saveDocumentToS3(file, 'templateFiles/' + workflowTemplateId + '/' + file.name);
    }

    async retrieveTemplateDocumentFromCloud(workflowTemplateId, filename){
        return await this.documentRepository.getDocumentFromS3('templateFiles/' + workflowTemplateId + '/' +filename);
    }


    async deleteTemplateDocumentFromCloud(workflowTemplateId){
        await this.documentRepository.deleteDocumentFromS3("templateFiles/" + workflowTemplateId);
    }

    async saveDocument(file: File, fileData: Buffer, id: ObjectId): Promise<ObjectId>{
        try{
            const doc = new Document({
                name: file.name,
                size: file.size,
                path: id + '/' +file.name,
                workflowId: id
            })
            return await this.documentRepository.saveDocument(doc, fileData, file.name);
        }
        catch(err){
            throw new ServerError("Could not save document, error message: " + err.message);
        }
    }

    async updateDocument(file: File, id: ObjectId, phaseNumber){
        try{
            await this.documentRepository.updateDocumentS3(file, id, phaseNumber);
        }
        catch(err){
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async deleteDocument(workflowId, documentId){
        await this.documentRepository.deleteDocumentFromS3(workflowId);
        await this.documentRepository.deleteDocument(documentId);
    }

    async retrieveOriginalDocument(docId, workflowId){
        try {
            const documentMetadata = await this.documentRepository.getDocument(docId);
            const filedata = await this.documentRepository.getDocumentFromS3('workflows/' + workflowId + '/' + documentMetadata.name);
            return {status: "success", data: {filedata: filedata, metadata: documentMetadata}, message: ""};
        }
        catch(err){
            console.log(err);
            throw new ServerError("The Document Workflow database could not be reached at this time, please try again later.");
        }
    }

    async retrieveDocument(docId, workflowId, currentPhase) : Promise<any> {

        const metadata = await this.documentRepository.getDocument(docId);
        const filedata = await this.documentRepository.getDocumentFromS3('workflows/' + workflowId +'/phase' + currentPhase +'/' + metadata.name);
        if(filedata === null)
            throw "The specified document does not exist.";

        return {metadata: metadata, filedata: filedata};
    }

    async turnBufferIntoFile(filedata, metadata): Promise<any>{
        const buf = Buffer.from(filedata.Body);

        fs.open(metadata.doc_name, 'w', (err,fd)=>{
            if(err)
                throw 'Error retrieving the file';
            fs.write(fd, buf, 0, buf.length, null, function(err) {
                if (err) {
                    throw 'Error retrieving the file';
                }
                fs.close(fd, function() {
                    //console.log('file written successfully');
                });
            });
        });
    }

    async resetFirstPhaseDocument(workflowId, documentId) {
        const metadata = await this.documentRepository.getDocument(documentId);
        const originalDocument = await this.documentRepository.getDocumentFromS3('workflows/' + workflowId + '/' + metadata.name);
        await this.documentRepository.updateDocumentS3WithBuffer('workflows/' + workflowId +'/phase0/' + metadata.name, originalDocument.Body);

    }

    async addDocumentToTrainingSet(document){
        await this.documentRepository.saveDocumentToS3(document, "trainingData/" + document.name);
    }
}

