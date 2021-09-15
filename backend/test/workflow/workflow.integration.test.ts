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
import { PhaseService } from "../../src/phase/PhaseService";
import encryption from "../../src/crypto/encryption";
import WorkflowTemplateService from "../../src/workflowTemplate/WorkflowTemplateService";
import WorkflowHistoryService from "../../src/workflowHistory/WorkflowHistoryService";
import WorkflowTemplateRepository from "../../src/workflowTemplate/WorkflowTemplateRepository";
import WorkflowHistoryRepository from "../../src/workflowHistory/WorkflowHistoryRepository";

describe("Workflow sub-system: integration tests", () => {
    let workflowService;
    let workflowController;
    let userService;
    let documentService;
    let encrypt;

    beforeAll(async () => {
        await Database.get();
    });

    beforeEach(() => {
        userService = new UserService(new UserRepository());
        documentService = new DocumentService(new DocumentRepository());
        encrypt = new encryption();
        workflowService = new WorkflowService(
            new WorkflowRepository(),
            documentService,
            userService,
            new PhaseService(new PhaseRepository()),
            new WorkflowTemplateService(new WorkflowTemplateRepository(), userService, documentService),
            new WorkflowHistoryService(new WorkflowHistoryRepository(), encrypt),
            encrypt)
        workflowController = new WorkflowController(workflowService, new Authenticator());
    });

    afterAll(async () => {
        await Database.disconnect();
    });

    it("Should create a new workflow, if it doesn't exist", () => {

    })

    it("should delete the workflow", () => {

    })
})