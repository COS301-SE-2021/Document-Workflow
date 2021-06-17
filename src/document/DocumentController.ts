import { Router } from "express";
import { autoInjectable } from "tsyringe";
import DocumentService from "./DocumentService";
import { DocumentI } from "./Document";
import fs from "fs";

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
    /*
    async uploadDocumentRoute(request) {
        try {
            return await this.documentService.uploadDocument(request);
        } catch (err) {
            throw err;
        }
    }*/

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

        /*this.router.post("", async (req,res) => {
            try {
                res.status(200).json(await this.uploadDocumentRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });*/

        this.router.post('/retrieve', async (req,res)=>{
            try {
                //TODO: look at how we are returning the document. Will probably have to return a buffer to the frontend side instead of piping a readStream
                const temp_res = await this.retrieveDocumentRoute(req);
                const readStream = fs.createReadStream(temp_res.data.filepath);
                readStream.pipe(res);
                //have to remember to delete the temporary file

            } catch(err){
                res.status(200).json({status:"error", data:{}, message:err});
            }
        });

        return this.router;
    }
}