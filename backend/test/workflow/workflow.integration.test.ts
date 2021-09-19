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


describe("Workflow sub-system: integration tests", () => {
    let workflowService;
    let workflowController;
    let userService;
    let documentService;
    let encrypt;

    const user1 = testUsers.user1;
    let realUser1: IUser;
    const workflow1 = testWorkflows.workflow1;
    let realWorkflow1;

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

    it("Should create a new workflow, if it doesn't exist", async () => {
        const wf = await workflowService.createWorkflow()
    });

    it("Should add a phase to the created Workflow", async () => {

    });

    it("should delete the workflow", async () => {

    });

    it("Should delete test user 1", async () => {
        if(realUser1){
            const del = await deleteTestUser(realUser1, userService);
            expect(del.email).toBe(user1.email);
        }

    });
})