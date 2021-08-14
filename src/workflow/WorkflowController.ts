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
            console.log("THIS PHASE HAS THE FOLLOWING USERS OBJECT");
            console.log(phase.users);
            convertedPhases.push(new Phase({
                users: JSON.stringify(phase.users), //The input users array is actually an array with a single JSON string
                description: phase.description,
                annotations: phase.annotations
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
        //There is nothing to check for here. The only required parameter is the
        //user parameter which is set by the middleware call to authenticate,which
        //extracts this data from the input JWT.
        try{
            return await this.workflowService.getUsersWorkflowData(req.user);
        } catch(err) {
            console.log(err);
            throw new ServerError(err.toString());
        }
    }

    /**
     * This function is responsible for updating a phase of a workflow, the workflows document and, if certain conditions are met,
     * the current phase and status of the workflow. The information we require in the request is:
     * The workflow id
     * The user who is updating the phase of this workflow
     * Whether or not they accept
     * (Optional) the new document that has been edited (only checked for if the user is a signing user)
     * @param req
     * @private
     */
    private async updatePhase(req) {
        if(!req.body.workflowId || !req.body.accept){
            throw new RequestError("There was something wrong with the request");
        }
        if(req.files === null) {
            const files = {document: null};
            req.files = files;
        }
        try{
            return await this.workflowService.updatePhase(req.user, req.body.workflowId, req.body.accept, req.files.document);
        } catch(err) {
            console.log(err)
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
            try {
                res.status(200).json(await this.getUsersWorkflowData(req));
            } catch(err){
                console.log(err);
                await handleErrors(err,res);
            }
        });

        this.router.post('/updatePhase', this.auth, async (req,res) =>{
            console.log('getting wokflow data for a specific user');
            try {
                res.status(200).json(await this.updatePhase(req));
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