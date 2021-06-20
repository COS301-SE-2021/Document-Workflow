import { Router } from "express";
import { autoInjectable } from "tsyringe";
import DocumentService from "./DocumentService";
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

        return this.router;
    }
}