import { injectable } from "tsyringe";
import DocumentRepository from "./DocumentRepository";

@injectable()
export default class DocumentService {
    documentRepository: DocumentRepository;

    constructor(documentRepository: DocumentRepository) {
        this.documentRepository = documentRepository;
    }

    getDocuments(response) {
        return this.documentRepository.getDocuments()
            .then((documents) => {
                return response.status(200).json(documents);
            })
            .catch((err) => {
                return err;
            });
    }

    postDocument(request, response) {
        if(!request.files || Object.keys(request.files).length === 0) {
            return response.status(400).json({
                message: "No files sent"
            });
        } else {
            this.documentRepository.postDocument(request)
                .then(() => {
                    return response.status(200).json({
                        message: "successfully posted document"
                    })
                })
                .catch((err) => {
                    return err;
                })
        }
    }
}

