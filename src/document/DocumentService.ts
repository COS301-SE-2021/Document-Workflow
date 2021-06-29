import { injectable } from "tsyringe";
import DocumentRepository from "./DocumentRepository";
import { DocumentI } from "./Document";
import fs from 'fs';

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

    async convertToHTML(req) {
        return Promise.resolve(undefined);
    }
}

