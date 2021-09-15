import WorkflowRepository from "../../src/workflow/WorkflowRepository";
import WorkflowService from "../../src/workflow/WorkflowService";
import DocumentService from "../../src/document/DocumentService";
import UserRepository from "../../src/user/UserRepository";
import DocumentRepository from "../../src/document/DocumentRepository";
import WorkflowController from "../../src/workflow/WorkflowController";
import UserService from "../../src/user/UserService";
import { PhaseRepository } from "../../src/phase/PhaseRepository";
import Authenticator from "../../src/security/Authenticate";
import sinon from "sinon";
import WorkflowTemplateService from "../../src/workflowTemplate/WorkflowTemplateService";
// @ts-ignore
import crypto from "crypto";
import { PhaseError } from "../../src/error/Error";
import encryption from "../../src/crypto/encryption";
import WorkflowHistoryService from "../../src/workflowHistory/WorkflowHistoryService";
import WorkflowTemplateRepository from "../../src/workflowTemplate/WorkflowTemplateRepository";
import WorkflowHistoryRepository from "../../src/workflowHistory/WorkflowHistoryRepository";

describe("unit tests for workflow", () => {
    let workflowRepository;
    let userRepository;
    let documentRepository;
    let phaseRepository;
    let workflowService;
    let userService;
    let documentService;
    let phaseService;
    let authenticationService;
    let workflowController;
    let workflowHistoryService;
    let workflowTemplateService;
    let encrypt;

    const randomObjectId = crypto.randomBytes(12);
    const userEmail1 = "email1@user.com";
    const userEmail2 = "email2@user.com";
    const userEmail3 = "email3@user.com";
    const randomDocument = crypto.randomBytes(20);

    beforeEach(() => {
        workflowRepository = new WorkflowRepository();
        userRepository = new UserRepository();
        documentRepository = new DocumentRepository();
        phaseRepository = new PhaseRepository();
        userService = new UserService(userRepository);
        documentService = new DocumentService(documentRepository);
        authenticationService = new Authenticator();
        encrypt = new encryption();
        workflowHistoryService = new WorkflowHistoryService(new WorkflowHistoryRepository(), encrypt)
        workflowTemplateService = new WorkflowTemplateService(new WorkflowTemplateRepository(), userService, documentService)

        workflowService = new WorkflowService(
            workflowRepository,
            documentService,
            userService,
            phaseService,
            workflowTemplateService,
            workflowHistoryService,
            encrypt);

        workflowController = new WorkflowController(workflowService, authenticationService);
    })

    it("should fail to create a workflow with non-existent users", async () => {
        sinon.stub(userService, "getUserByEmail").returns(undefined);
        const jsonPhases = JSON.stringify([
            {
                annotations: "alonghexstring",
                description: "description of phase 1",
                users: [ userEmail1, userEmail2 ],
                signingUserId: userEmail3
            }
        ])
        const request = {
            body: {
                name: "WorkflowName",
                description: "description of the workflow",
                phases: jsonPhases
            },
            user: {
              email: "testemail@email.com",
              _id: randomObjectId
            },
            files: {
                document: {
                    name: "testDocument",
                    data: randomDocument
                }
            }
        }
        await expect(workflowController.createWorkFlow(request)).rejects.toThrow(
            PhaseError
        );
    })

    it("should fail to delete a workflow that doesn't exist", async() => {
        sinon.stub(workflowRepository, "getWorkflow").returns(undefined);
        const response = await workflowController.deleteWorkFlow({
            body: {
                workflowId: randomObjectId
            },
            user: {
                email: userEmail1
            }
        });
        expect(response).toStrictEqual({status: "failed", data: {}, message: "Workflow does not exist"});
    })
})