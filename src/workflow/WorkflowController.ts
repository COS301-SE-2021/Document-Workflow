import { Router } from "express";
import { injectable } from "tsyringe";
import WorkFlowService from "./WorkflowService";
import Authenticator from "../security/Authenticate";
import { RequestError, ServerError } from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";
import { WorkflowProps } from "./Workflow";
import { PhaseProps } from "../phase/Phase";
import { ObjectId } from "mongoose";

@injectable()
export default class WorkflowController {
    // Errors in Controller files -> RequestError, TimeoutError, AuthenticationError
    router: Router;

    constructor(
        private workflowService: WorkFlowService,
        private authenticationService: Authenticator) {
        this.router = new Router();
    }

    auth = this.authenticationService.Authenticate;

    //Check for correct input, check that it exists, send object through to service
    async createWorkFlow(req) : Promise<ObjectId> {
        /*  request object looks like:
            body: {
            name: "Workflow Name",
            ownerId: "ObjectId of owner user",
            description: "description of new workflow",
            phases: [{
                    annotations: "....",
                    description: "description of phase 1",
                    users: [ "ObjectId of User 1", "ObjectId of User 2", "ObjectId of User 3" ]},
                    signingUserId: "ObjectId of Signing User"
                {
                    annotations: "....",
                    description: "description of phase 1",
                    users: [ "ObjectId of User 1", "ObjectId of User 2", "ObjectId of User 3" ]},
                    signingUserId: "ObjectId of Signing User"]
            },
            files: {
                file: "...."
            }*/
        //TODO: Check names of request variables
        //Check the request for the proper variables
        if(!req.body.name || !req.body.ownerId || !req.body.description
            || !req.files.file || !req.body.phases) {
            throw new RequestError("There was something wrong with the request");
        }

        //Check each phase for proper variables
        const phases = JSON.parse(req.body.phases);
        phases.forEach(phase => {
            if(!phase.annotations || !phase.description || !phase.users || !phase.signingUserId){
                throw new RequestError("There was something wrong with the request");
            }
        })

        //parse request, setup WorkflowProps object to send through
        const workflow: WorkflowProps = {
            _id: undefined,
            __v: undefined,
            name: req.body.name,
            ownerId: req.body.ownerId,
            documentId: undefined,
            description: req.body.description,
            phases: undefined
        }

        const convertedPhases: PhaseProps[] = [];
        phases.forEach( phase => {
            convertedPhases.push({
                users: phase.users,
                description: phase.description,
                signingUserId: phase.signingUserId,
                annotations: phase.annotations
                //userAccepts: undefined
            }as PhaseProps)
        })

        try{
            return await this.workflowService.createWorkFlow(workflow, req.files.file, convertedPhases);

        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    /*async getWorkFlowDetails(req):Promise<any>{
        try{
            return await this.workflowService.getWorkFlowDetails(req);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async deleteWorkFlow(req) {
        try{
            return await this.workflowService.deleteWorkFlow(req);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }*/

    routes() {
        this.router.post("", /*this.auth,*/ async (req, res) => {
            try {
                res.status(200).json(await this.createWorkFlow(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        /*this.router.post("/getDetails", this.auth, async (req,res) =>{
            try {
                res.status(200).json(await this.getWorkFlowDetails(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post("/delete",this.auth, async(req,res)=>{
            try {
                res.status(200).json(await this.deleteWorkFlow(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });*/
        return this.router;
    }

}