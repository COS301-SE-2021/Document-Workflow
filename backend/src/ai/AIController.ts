import { Router } from "express";
import { injectable } from "tsyringe";
import sanitize from "../security/Sanitize";
import {RequestError, ServerError} from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";
import Authenticator from "../security/Authenticate";
import sanitizeRequest from "./../security/Sanitize";
import {AIService} from "./AIService";

@injectable()
export default class AIController{
    private readonly router: Router;

    constructor(private aiService: AIService) {
        this.router = new Router();
    }

    private async getClassifier(req) {
        return this.aiService.retrieveClassifierData();
    }

    private async getDecisionTrees(req) {
        return this.aiService.getDecisionTreesData();
    }

    private async addToTrainingData(req){
        return this.aiService.addToTrainingData(req.files.file);
    }

    routes() {
        this.router.get("/getClassifier", async(req,res)=>{
            try {
                res.status(200).json(await this.getClassifier(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.get("/getDecisionTrees", async(req,res)=>{
            try {
                res.status(200).json(await this.getDecisionTrees(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post("/addToTrainingData", async(req,res)=>{
            try {
                res.status(200).json(await this.addToTrainingData(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        return this.router;
    }
}