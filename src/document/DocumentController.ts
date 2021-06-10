import { Router } from "express";
import { autoInjectable } from "tsyringe";
import DocumentService from "./DocumentService";

@autoInjectable()
export default class DocumentController{
    documentService: DocumentService;
    router: Router;

    constructor(documentService: DocumentService) {
        this.documentService = documentService;
        this.router = new Router();
    }

    getDocumentsRoute(response) {
        return this.documentService.getDocuments(response);
    }

    postDocumentRoute(request, response) {
        return this.documentService.postDocument(request, response);
    }

    routes() {
        this.router.get("", async (req, res) => {
            await res.send(this.getDocumentsRoute(res));
        });

        this.router.post("", async (req,res) => {
            await res.send(this.postDocumentRoute(req, res));
        })

        return this.router;
    }
}