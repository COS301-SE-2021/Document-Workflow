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

    async uploadDocumentRoute(request) {
        try {
            return await this.documentService.uploadDocument(request);
        } catch (err) {
            throw err;
        }
    }

    async retrieveDocumentRoute(request) :Promise<any>{
        try {
            return await this.documentService.retrieveDocument(request);
        } catch (err) {
            throw err;
        }
    }

    routes() { //TODO: get rid of this later on since it isn't as secure as a post request.
        this.router.get("", async (req, res) => {
            try {
                res.status(200).json(await this.getDocumentsRoute());
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post("", async (req,res) => {
            try {
                res.status(200).json(await this.uploadDocumentRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post('/retrieve', async (req,res)=>{
            try {
                res.status(200).json(await this.retrieveDocumentRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        return this.router;
    }
}