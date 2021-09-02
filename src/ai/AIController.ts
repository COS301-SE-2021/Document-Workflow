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


    routes() {
        this.router.get("/getClassifier", async(req,res)=>{
            try {
                res.status(200).json(await this.getClassifier(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        return this.router;
    }


}