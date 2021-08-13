import { Router } from "express";
import { injectable } from "tsyringe";
import WorkFlowService from "./WorkflowService";
import Authenticator from "../security/Authenticate";
import { RequestError, ServerError } from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";
import { WorkflowProps } from "./Workflow";
import { PhaseProps, Phase } from "../phase/Phase";

@injectable()
export default class WorkflowController {
    //Errors in Controller files -> RequestError, TimeoutError, AuthenticationError
    router: Router;

    constructor(
        private workflowService: WorkFlowService,
        private authenticationService: Authenticator) {
        this.router = new Router();
    }

    auth = this.authenticationService.Authenticate;

    //Check for correct input, check that it exists, send object through to service
    async createWorkFlow(req) : Promise<any> {
        /*  request object looks like:
            body: {
            name: "Workflow Name",
            ownerId: "ObjectId of owner user",
            description: "description of new workflow",
            phases: [{
                    annotations: "....",
                    description: "description of phase 1",
                    users: [ "ObjectId of User 1", "ObjectId of User 2", "ObjectId of User 3" ]},
                    signingUserId: "ObjectId of Signing User" //NOTE as of right now phases do not have the signingUserID as a separate entity from users array
                {
                    annotations: "....",
                    description: "description of phase 1",
                    users: [ "ObjectId of User 1", "ObjectId of User 2", "ObjectId of User 3" ]},
                    signingUserId: "ObjectId of Signing User"]
            },
            files: {
                document: "...."
            }*/

        //Check the request for the proper variables
        if(!req.body.name || !req.body.description
            || !req.files.document || !req.body.phases) { //owner ID will be added after the auth is used!!! dont check for it here
            throw new RequestError("There was something wrong with the request");
        }

        //Check each phase for proper variables
        const phases = JSON.parse(req.body.phases);
        phases.forEach(phase => {
            if(!phase.annotations || !phase.description || !phase.users){
                throw new RequestError("There was something wrong with the request");
            }
        })

        //parse request, setup WorkflowProps object to send through
        const workflow: WorkflowProps = {
            _id: undefined,
            __v: undefined,
            name: req.body.name,
            ownerId: req.user._id,
            ownerEmail: req.user.email,
            documentId: undefined,
            description: req.body.description,
            phases: undefined
        }

        const convertedPhases = [];

        phases.forEach( phase => {
            /*console.log(phase.users);
            let accepts = [];
            let users = [];
            for(let k=0; k<phase.users.length; ++k){
                accepts.push({userEmail: phase.users[k][0], accept: 'false'});
                users.push(phase.users[k][0]);
            }*/
            console.log("THIS PHASE HAS THE FOLLOWING USERS OBJECT");
            console.log(phase.users);
            convertedPhases.push(new Phase({
                users: JSON.stringify(phase.users), //The input users array is actually an array with a signle JSON strng
                description: phase.description,
                //signingUserId: phase.signingUserId,
                annotations: phase.annotations,
                userAccepts: ""
            }));
        })

        try{
            return await this.workflowService.createWorkFlow(workflow, req.files.document, convertedPhases);

        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    async getWorkFlowDetails(req):Promise<any>{

        if(!req.body.id)
            throw new RequestError("There was something wrong with the request");

        try{
            return await this.workflowService.getWorkFlowById(req.body.id);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async getUsersWorkflowData(req) {
        try{
            return await this.workflowService.getUsersWorkflowData(req.user);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    /*
    private async deleteWorkFlow(req) {
        try{
            return await this.workflowService.deleteWorkFlow(req);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }*/

    routes() {
        this.router.post("",  this.authenticationService.Authenticate ,async (req, res) => { //TODO: re-enable authentication
            try {
                res.status(200).json(await this.createWorkFlow(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post("/getDetails", this.auth, async (req,res) =>{
            try {
                res.status(200).json(await this.getWorkFlowDetails(req));
            } catch(err){
                await handleErrors(err,res);
            }
        });

        this.router.post('/getUserWorkflowsData', this.auth, async (req,res) =>{
            console.log('getting wokflow data for a specific user');
            try {
                res.status(200).json(await this.getUsersWorkflowData(req));
            } catch(err){
                console.log(err);
                await handleErrors(err,res);
            }
        });



        /*
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

/*
      \    /\
       )  ( ') Meow Meow Meow
      (  /  )
       \(__)|
 */