import Database from "../../src/Database";
import WorkflowRepository from "../../src/workflow/WorkflowRepository";
import WorkflowService from "../../src/workflow/WorkflowService";
import WorkflowController from "../../src/workflow/WorkflowController";
import Authenticator from "../../src/security/Authenticate";
import UserRepository from "../../src/user/UserRepository";
import UserService from "../../src/user/UserService";
import DocumentRepository from "../../src/document/DocumentRepository";
import DocumentService from "../../src/document/DocumentService";
import { PhaseRepository } from "../../src/phase/PhaseRepository";
import PhaseService from "../../src/phase/PhaseService";
import WorkflowTemplateService from "../../src/workflowTemplate/WorkflowTemplateService";
import WorkflowHistoryService from "../../src/workflowHistory/WorkflowHistoryService";
import WorkflowTemplateRepository from "../../src/workflowTemplate/WorkflowTemplateRepository";
import WorkflowHistoryRepository from "../../src/workflowHistory/WorkflowHistoryRepository";
import { testUsers, createTestUser, deleteTestUser, verifyTestUser, loginTestUser } from "../testData/test-users";
import { IUser } from "../../src/user/IUser";
import { testWorkflows } from "../testData/test-workflows";
import { IWorkflow } from "../../src/workflow/IWorkflow";
import { IPhase } from "../../src/phase/IPhase";


describe("Workflow sub-system: integration tests", () => {
    let workflowService;
    let workflowController;
    let userService;
    let documentService;
    let encrypt;

    const user1 = testUsers.user1;
    const user2 = testUsers.user2;
    let realUser1: IUser;
    let realUser2: IUser;
    const workflow1 = testWorkflows.workflow1;
    let realWorkflow1: IWorkflow;

    beforeAll(async () => {
        await Database.get();
    });

    beforeEach(() => {
        userService = new UserService(new UserRepository());
        documentService = new DocumentService(new DocumentRepository());
        workflowService = new WorkflowService(
            new WorkflowRepository(),
            documentService,
            userService,
            new PhaseService(new PhaseRepository()),
            new WorkflowTemplateService(new WorkflowTemplateRepository(), userService, documentService),
            new WorkflowHistoryService(new WorkflowHistoryRepository()),
            )
        workflowController = new WorkflowController(workflowService, new Authenticator());
    });

    afterAll(async () => {
        await Database.disconnect();
    });

    it("Should delete, create, verify, login user1", async () => {
        const res = await userService.getUserByEmail(user1.email);
        if(res){const del = await deleteTestUser(res, userService);}
        const user = await createTestUser(user1, userService);
        expect(user.email).toBe(user1.email);
        const verify = await verifyTestUser(user, userService);
        const token = await loginTestUser(user1, userService);
        if(token) user1.authToken = token;
        realUser1 = user;
    });

    it("Should delete, create, verify, login user2", async () => {
        const res = await userService.getUserByEmail(user2.email);
        if(res){const del = await deleteTestUser(res, userService);}
        const user = await createTestUser(user2, userService);
        expect(user.email).toBe(user2.email);
        const verify = await verifyTestUser(user, userService);
        const token = await loginTestUser(user2, userService);
        if(token) user2.authToken = token;
        realUser2 = user;
    });

    it("Should create a new workflow, if it doesn't exist", async () => {
        //workflow: IWorkflow, file, phases: IPhase[], template: any, user
        const newWorkflow: IWorkflow = {
            description: workflow1.description,
            name: workflow1.name,
            ownerEmail: realUser1.email,
            ownerId: realUser1._id
        }

        const phases: IPhase[] = workflow1.phases;

        /*const template: IWorkflowTemplate = {
            documentName: "",
            phases: [],
            templateDescription: "",
            templateName: "",
            templateOwnerEmail: "",
            templateOwnerId: undefined,
            workflowDescription: "",
            workflowName: ""
        }*/

        const userAuth = {
            email: realUser1.email,
            _id: realUser1._id
        }
        const wf = await workflowService.createWorkFlow(
            newWorkflow,
            workflow1.document,
            phases,
            null,
            userAuth);
        if(wf) {
            const id = wf.data.id;
            //check that it exists using getWorkFlowById:
            const response = await workflowService.getWorkFlowById(id);
            const check: IWorkflow = response.data;
            check._id = id;
            realWorkflow1 = check;
            expect(check._id).toBe(realWorkflow1._id);
        }
        else throw "Shit went down"
    });

    it("Should check if workflow has been added to user2's workflows", async () => {
        const data = await userService.getUserById(realUser2._id);
        expect(data.workflows).toContain(String(realWorkflow1._id));
    });

    /*it("Should add a phase to the created Workflow", async () => {

    });*/

    it("should delete the workflow", async () => {
        const res = await workflowService.deleteWorkFlow(realWorkflow1._id, realUser1.email);
        expect(res).toStrictEqual({status: "success", data:{}, message:""});
    });

    it("Should delete test user 1 and test user 2", async () => {
        if(realUser1){
            const del = await deleteTestUser(realUser1, userService);
            expect(del.email).toBe(user1.email);
        }
        if(realUser2){
            const del = await deleteTestUser(realUser2, userService);
            expect(del.email).toBe(user2.email);
        }
    });
})