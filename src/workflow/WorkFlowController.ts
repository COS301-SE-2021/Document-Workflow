import { Router } from "express";
import { autoInjectable } from "tsyringe";
import UserService from "./../user/UserService";
import { UserI } from "./../user/User";
import workFlowService from "./WorkFlowService";
import {WorkflowI} from "./WorkFlow"
import WorkFlowService from "./WorkFlowService";

@autoInjectable()
export default class WorkFlowController{
    router: Router;

    constructor(private workflowService: WorkFlowService) {
        this.router = new Router();
    }



}