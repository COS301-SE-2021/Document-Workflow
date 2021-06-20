import { injectable } from "tsyringe";
import DocumentRepository from "./DocumentRepository";
import Document from "./Document";
import RequestError from "../error/RequestError";

@injectable()
export default class DocumentService {

    constructor(private documentRepository: DocumentRepository) {}

    async getDocuments(): Promise<Document[]> {
        try{
            return await this.documentRepository.getDocuments();
        }catch(err){
            throw new RequestError("Could not retrieve documents");
        }
    }

    async uploadDocument(req): Promise<Document>{
        if(!req.body || !req.files){
            throw new RequestError("Missing required properties");
        }
        try{
            return await this.documentRepository.postDocument(req.body, req.files.file);
        }
        catch(err) {
            throw new RequestError("Could not store document");
        }
    }

    async retrieveDocument(req): Promise<Document> {
        if(!req.body.id){
            throw new RequestError("Missing required properties");
        }
        try {
            return await this.documentRepository.getDocument(req.body.id);
        }
        catch(err){
            throw new RequestError("Could not retrieve document");
        }

    }
}

