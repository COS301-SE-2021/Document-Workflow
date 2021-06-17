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
            return {status:"success", data:{metadata: metadata, buffer:  Buffer.from(filedata.Body)}, message:"" };
        }
        catch(err)
        {
            console.log(err);
            throw err;
        }
    }

    async turnBufferIntoFile(filedata, metadata): Promise<any>{

    }
}

