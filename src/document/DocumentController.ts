import { Router } from "express";
import { autoInjectable } from "tsyringe";
import DocumentService from "./DocumentService";
import { DocumentI } from "./Document";

@autoInjectable()
export default class DocumentController{
    documentService: DocumentService;
    router: Router;

    constructor(documentService: DocumentService) {
        this.documentService = documentService;
        this.router = new Router();
    }

    async getDocumentsRoute(): Promise<DocumentI[]> {
        try{
            return await this.documentService.getDocuments();
        } catch(err) {
            throw err;
        }
    }

    async postDocumentRoute(request) {
        try {
            return await this.documentService.postDocument(request);
        } catch (err) {
            throw err;
        }
    }

    routes() {
        this.router.get("", async (req, res) => {
            try {
                res.status(200).json(await this.getDocumentsRoute());
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post("", async (req,res) => {
            try {
                res.status(200).json(await this.postDocumentRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });
        return this.router;
    }
}