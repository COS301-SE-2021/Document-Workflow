import { Router } from "express";
import { injectable } from "tsyringe";
import WorkFlowService from "./WorkflowService";
import Authenticator from "../security/Authenticate";
import { RequestError, ServerError } from "../error/Error";
import { handleErrors } from "../error/ErrorHandler";
import { Phase } from "../phase/Phase";
import { logger } from "../LoggingConfig";
import { IWorkflow } from "./IWorkflow";

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
    async createWorkflowRoute(req): Promise<any> {
        //console.log(req);
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
            || !req.files.document || !req.body.phases) {
            throw new RequestError("There was something wrong with the request");
        }

        //Check each phase for proper variables
        const phases = JSON.parse(req.body.phases);
        //console.log(req.body.phases);
        phases.forEach(phase => {
            if(!phase.annotations || !phase.description || !phase.users){
                throw new RequestError("There was something wrong with the request");
            }
        });

        //parse request, setup WorkflowProps object to send through
        const workflow: IWorkflow = {
            name: req.body.name,
            ownerId: req.user._id,
            ownerEmail: req.user.email,
            description: req.body.description
        }

        const convertedPhases = [];

        phases.forEach( phase => {
            convertedPhases.push(new Phase({
                users: JSON.stringify(phase.users), //The input users array is actually an array with a single JSON string
                description: phase.description,
                annotations: phase.annotations
            }));
        })
        console.log("CONVERTED PHASES:\n" + convertedPhases);

        if(!req.body.template){
            req.body.template = null;
        }

        return await this.workflowService.createWorkFlow(workflow, req.files.document, convertedPhases, req.body.template, req.user);
    }

    async getWorkflowDetailsRoute(req): Promise<any>{
        if(!req.body.id)
            throw new RequestError("There was something wrong with the request");
        try{
            return await this.workflowService.getWorkFlowById(req.body.id);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async getUsersWorkflowDataRoute(req) {
        try{
            return await this.workflowService.getUsersWorkflowData(req.user._id);
        } catch(err) {
            console.log(err);
            throw new ServerError(err.toString());
        }
    }

    private async retrieveDocumentRoute(req) {
        logger.info("Retrieving a document given a workflow id");
        if(!req.body.workflowId){
            throw new RequestError("There was something wrong with the request");
        }
        try{
            return await this.workflowService.retrieveDocument(req.body.workflowId, req.user.email);
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
    private async updatePhaseRoute(req) {
        if(!req.body.workflowId || !req.body.accept || !req.files){
            throw new RequestError("There was something wrong with the request");
        }
        try{
            return await this.workflowService.updatePhase(req.user, req.body.workflowId, req.body.accept, req.files.document);
        } catch(err) {
            console.log(err)
            throw new ServerError(err.toString());
        }
    }

    private async updatePhaseAnnotationsRoute(req) {
        if(!req.body.workflowId ||  !req.body.annotations){
            throw new RequestError("There was something wrong with the request");
        }
        try{
            return await this.workflowService.updatePhaseAnnotations(req.user.email, req.body.workflowId, req.body.annotations);
        } catch(err) {
            console.log(err)
            throw new ServerError(err.toString());
        }
    }

    private async retrieveWorkflowRoute(req) {
        if(!req.body.workflowId){
            throw new RequestError("There was something wrong with the request");
        }
        try{
            return await this.workflowService.retrieveWorkflow(req.body.workflowId, req.user.email);
        } catch(err) {
            console.log(err)
            throw new ServerError(err.toString());
        }
    }

    private async deleteWorkflowRoute(req) {
        if(!req.body.workflowId)
            throw new RequestError("There was something wrong with the request");
        try{
            return await this.workflowService.deleteWorkFlow(req.body.workflowId, req.user.email);
        } catch(err) {
            throw new ServerError(err.toString());
        }
    }

    private async editWorkflowRoute(req) {
        if(!req.body.name || !req.body.description ||
            !req.body.phases || !req.body.workflowId) {
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

        const convertedPhases = [];

        phases.forEach( phase => {
            convertedPhases.push(new Phase({
                users: JSON.stringify(phase.users), //The input users array is actually an array with a single JSON string
                description: phase.description,
                annotations: phase.annotations,
                status: phase.status,
                _id: phase._id  //TODO: check if 'Create' status phases are being sent through with an id. They shouldn't be.
            }));
        });

        try{
            return await this.workflowService.editWorkflow(req.body.description, req.body.name, convertedPhases, req.user.email, req.body.workflowId);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    private async revertWorkflowPhaseRoute(req) {
        if(!req.body.workflowId)
            throw new RequestError("An id must be supplied to revert the phase of a workflow");
        try{
            return await this.workflowService.revertWorkflowPhase(req.body.workflowId, req.user.email);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    private async getOriginalDocumentRoute(req) {
        if(!req.body.workflowId)
            throw new RequestError("An id must be supplied to revert the phase of a workflow");
        try{
            return await this.workflowService.getOriginalDocument(req.body.workflowId, req.user.email);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    private async getWorkflowHistoryRoute(req) {
        if(!req.body.workflowId)
            throw new RequestError("A workflowId must be supplied to revert the phase of a workflow");
        try{
            return await this.workflowService.getWorkflowHistory(req.body.workflowId, req.user.email);
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    private async verifyDocument(req) {

        if(!req.body.workflowId || ! req.body.hash){
            throw new RequestError("A workflowId and input document is required to verify a document");
        }

        return await this.workflowService.verifyDocument(req.body.workflowId, req.body.hash, req.user);
    }

    //----------------------------------------------------------------------------------

    routes() {
        //=============================================||| POST   |||===================================================

        this.router.post("",  this.authenticationService.Authenticate ,async (req, res) => {
            try {
                res.status(200).json(await this.createWorkflowRoute(req));
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/getDetails", this.auth, async (req,res) =>{
            try {
                res.status(200).json(await this.getWorkflowDetailsRoute(req));
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post('/getUserWorkflowsData', this.auth, async (req,res) =>{
            try {
                res.status(200).json(await this.getUsersWorkflowDataRoute(req));
            } catch(err){
                console.log(err);
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post('/retrieveWorkflow', this.auth, async(req,res) =>{
            try {
                res.status(200).json(await this.retrieveWorkflowRoute(req));
            } catch(err){
                console.log(err);
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post('/updatePhase', this.auth, async (req,res) =>{
            console.log('getting workflow data for a specific user');
            try {
                res.status(200).json(await this.updatePhaseRoute(req));
            } catch(err){
                console.log(err);
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post('/retrieveDocument', this.auth, async (req,res) =>{
            console.log('Retrieving the document for a specific workflow');
            try {
                res.status(200).json(await this.retrieveDocumentRoute(req));
            } catch(err){
                res.status(400).json('help')
                console.log(err);
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post('/updatePhaseAnnotations', this.auth, async (req,res) =>{
            console.log('Retrieving the document for a specific workflow');
            try {
                res.status(200).json(await this.updatePhaseAnnotationsRoute(req));
            } catch(err){
                res.status(400).json({})
                console.log(err);
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/edit",this.auth, async(req,res)=>{
            try {
                res.status(200).json(await this.editWorkflowRoute(req));
            } catch(err){
                res.status(500).json({})
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/revertPhase",this.auth, async(req,res)=>{
            try {
                res.status(200).json(await this.revertWorkflowPhaseRoute(req));
            } catch(err){
                res.status(500).json({})
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/getOriginalDocument",this.auth, async(req,res)=>{
            try {
                res.status(200).json(await this.getOriginalDocumentRoute(req));
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/getWorkflowHistory", this.auth, async(req,res)=>{
            try {
                res.status(200).json(await this.getWorkflowHistoryRoute(req));
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        this.router.post("/verifyDocument", this.auth, async(req,res)=>{
            try{
                res.status(200).json(await this.verifyDocument(req));
            }
            catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        //=============================================||| DELETE |||===================================================

        this.router.post("/delete",this.auth, async(req,res)=>{
            try {
                res.status(200).json(await this.deleteWorkflowRoute(req));
            } catch(err){
                try{await handleErrors(err,res);}catch{}
            }
        });

        return this.router;
    }
}