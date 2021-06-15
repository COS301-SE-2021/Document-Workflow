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
            return await this.documentRepository.getDocuments({});
        }catch(err){
            throw err;
        }
    }

    /**
     *
     * @param document
     * @param workflow_id
     */
    async uploadDocument(document, workflow_id) : Promise<any>{
        try{
            return await this.documentRepository.postDocument(document, workflow_id);
        }
        catch(err)
        {
            throw err
        }
    }

    /*
    async uploadDocument(request) :Promise<any>{
        console.log("Received a request to upload a document")
        console.log(request.body)
        console.log(request.files)
        if(!request.files || Object.keys(request.files).length === 0) {
            throw "No files sent";
        } else {
            try {
                await this.documentRepository.postDocument(request)
                return "File Successfully uploaded";
            } catch (err) {
                throw err;
            }
        }
    }
    */

    async retrieveDocument(req) : Promise<any> {

    }
}

