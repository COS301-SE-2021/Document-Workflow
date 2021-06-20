import { Router } from "express";
import { autoInjectable } from "tsyringe";
import DocumentService from "./DocumentService";
import fs from "fs";
import Document from "./Document";
import jwt from "jsonwebtoken";
import ServerError from "../error/ServerError";

@autoInjectable()
export default class DocumentController{
    router: Router;

    constructor(private documentService: DocumentService) {
        this.router = new Router();
    }

    async auth(req,res,next){
        try{
            const token = req.header("Authorization").replace("Bearer ", "");
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = {id: decoded.id, email: decoded.email, token: token};
            next();
        }
        catch(err){
            console.error(err);
        }
    }

    async getDocumentsRoute(): Promise<Document[]> {
        try{
            return await this.documentService.getDocuments();
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    async uploadDocumentRoute(request): Promise<Document> {
        try {
            return await this.documentService.uploadDocument(request);
        } catch (err) {
            throw new ServerError(err.toString());
        }
    }

    private async testDeleteDocument(req) {
        try{
            await this.documentService.deleteDocument(req.body.workflow_id, req.body.document_id);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    async retrieveDocumentRoute(request): Promise<Document> {
        try {
            return await this.documentService.retrieveDocument(request);
        } catch (err) {
            throw new ServerError(err.toString());
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

        this.router.post("",  async (req,res) => {
            try {
                res.status(200).json(await this.uploadDocumentRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post('/retrieve', this.auth, async (req,res)=>{
            try {
                res.status(200).json(await this.retrieveDocumentRoute(req));
            } catch(err){
                res.status(400).json(err);
            }
        });
        /*
        this.router.post('/delete', async(req,res)=>{
            try {
                res.status(200).json(await this.testDeleteDocument(req));
            } catch(err){
                console.log(err);
                res.status(200).json({status:"error", data:{}, message:err});
            }
        })*/

        return this.router;
    }
}