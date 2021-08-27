import { Router } from "express";
import { injectable } from "tsyringe";
import WorkflowTemplateService from "./WorkflowTemplateService";
import Authenticator from "../security/Authenticate";
import { RequestError, ServerError } from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";


@injectable()
export default class WorkflowTemplateController {

    router: Router;
    constructor(
        private workflowTemplateService: WorkflowTemplateService,
        private authenticationService: Authenticator) {
        this.router = new Router();
    }

    async getWorkflowTemplateNameAndDescription(req){
        if(!req.body.workflowTemplateId){
            throw new RequestError("No workflowTemplateId specified");
        }

        return this.workflowTemplateService.getWorkflowTemplateNameAndDescription(req.body.workflowTemplateId);
    }

    async getWorkflowTemplateData(req){
        if(!req.body.workflowTemplateId){
            throw new RequestError("No workflowTemplateId specified");
        }

        return this.workflowTemplateService.getWorkflowTemplateData(req.body.workflowTemplateId, req.user);
    }

    auth = this.authenticationService.Authenticate;


    //----------------------------------------------------------------------------------

    routes() {

        this.router.post("/getWorkflowTemplateNameAndDescription", this.auth, async(req,res) =>{
            try {
                res.status(200).json( await this.getWorkflowTemplateNameAndDescription(req));
            }
            catch(err){
                await handleErrors(err, res);
            }
        });

        this.router.post("/delete",this.auth, async(req,res)=>{
            try {

            } catch(err){
                await handleErrors(err,res);
            }
        });
        return this.router;
    }
}

