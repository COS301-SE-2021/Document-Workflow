import { injectable } from "tsyringe";
import DocumentRepository from "./DocumentRepository";
import { DocumentI } from "./Document";

@injectable()
export default class DocumentService {
    documentRepository: DocumentRepository;

    constructor(documentRepository: DocumentRepository) {
        this.documentRepository = documentRepository;
    }

    async getDocuments(): Promise<DocumentI[]> {
        try{
            return await this.documentRepository.getDocuments();
        }catch(err){
            throw err;
        }
    }

    async postDocument(request) {

        if(!request.files || Object.keys(request.files).length === 0) {
            return { message: "No files sent" };
        } else {
            try {
                return await this.documentRepository.postDocument(request)
            } catch (err) {
                throw err;
            }
        }
    }
}

