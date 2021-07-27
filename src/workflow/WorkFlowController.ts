import { Router } from "express";
import { autoInjectable } from "tsyringe";
import UserService from "./../user/UserService";
import { UserI } from "./../user/User";
import workFlowService from "./WorkFlowService";
import {WorkFlowI} from "./WorkFlow"
import WorkFlowService from "./WorkFlowService";
import UserController from "./../user/UserController";
import Authenticator from "../Authenticate";

@autoInjectable()
export default class WorkFlowController{
    router: Router;

    constructor(private workflowService: WorkFlowService, private authenticator: Authenticator) {
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

    private async deleteWorkFlow(req) {
        try{
            return await this.workflowService.deleteWorkFlow(req);
        } catch(err) {
            throw err;
        }
    }

    private async updateDocument(req) {
        try{
            return await this.workflowService.updateDocument(req);
        } catch(err) {
            throw err;
        }
    }

    routes() {

        this.router.post("/updateDocument", this.authenticator.Authenticate, async (req, res) =>{
            try {
                res.status(200).json(await this.updateDocument(req));
            } catch(err){
                res.status(200).json(err);
            }
        });

        this.router.post("", this.authenticator.Authenticate, async (req, res) => {
            try {
                res.status(200).json(await this.createWorkFlow(req));
            } catch(err){
                res.status(200).json(err);
            }
        });

        this.router.post("/getDetails", this.authenticator.Authenticate, async (req,res) =>{
            try {
                res.status(200).json(await this.getWorkFlowDetails(req));
            } catch(err){
                res.status(400).json({status:"error", data:{}, message:err});
            }
        });

        this.router.post("/delete",this.authenticator.Authenticate, async(req,res)=>{
            try {
                res.status(200).json(await this.deleteWorkFlow(req));
            } catch(err){
                console.log(err);
                res.status(200).json({status:"error", data:{}, message:err});
            }
        });

        return this.router;
    }


}