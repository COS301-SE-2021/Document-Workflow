import { Router } from "express";
import { autoInjectable } from "tsyringe";
import UserService from "./../user/UserService";
import { UserI } from "./../user/User";
import workFlowService from "./WorkFlowService";
import {WorkFlowI} from "./WorkFlow"
import WorkFlowService from "./WorkFlowService";

@autoInjectable()
export default class WorkFlowController{
    router: Router;

    constructor(private workflowService: WorkFlowService) {
        this.router = new Router();
    }

    async createWorkFlow(req) : Promise<any> {
        try{
            return await this.workflowService.createWorkFlow(req);
        } catch(err) {
            throw err;
        }
    }

    async getWorkFlowDetails(req):Promise<any>{
        try{
            return await this.workflowService.getWorkFlowDetails(req);
        } catch(err) {
            throw err;
        }
    }

    routes() {

        this.router.post("",async (req, res) => {
            try {
                res.status(200).json(await this.createWorkFlow(req));
            } catch(err){
                res.status(400).json(err);
            }
        });

        this.router.post("/getDetails", async (req,res) =>{
            try {
                res.status(200).json(await this.getWorkFlowDetails(req));
            } catch(err){
                res.status(400).json({status:"error", data:{}, message:err});
            }
        });

        return this.router;
    }


}