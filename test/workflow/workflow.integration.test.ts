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

describe("Workflow sub-system: integration tests", () => {
    let workflowService;
    let workflowController;
    let userService;

    beforeAll(async () => {
        await Database.get();
    });

    beforeEach(() => {
        userService = new UserService(new UserRepository());
        workflowService = new WorkflowService(new WorkflowRepository(), new DocumentService(new DocumentRepository()), userService, new PhaseService(new PhaseRepository()));
        workflowController = new WorkflowController(workflowService, new Authenticator(new UserService(new UserRepository())));
    });

    afterAll(async () => {
        await Database.disconnect();
    });

    it("Should create a new workflow, if it doesn't exist", () => {

    })

    it("should delete the workflow", () => {

    })
})