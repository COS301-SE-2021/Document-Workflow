import DocumentController from "../../src/document/DocumentController";
import DocumentRepository from "../../src/document/DocumentRepository";
import DocumentService from "../../src/document/DocumentService";

describe("DocumentController: INTEGRATION TESTS", () => {
    let documentService;

    beforeEach(()=>{
        documentService = new DocumentService(new DocumentRepository());
    });

    test("One Document Found: ", async () => {

        // const documentController = new DocumentController(documentService);
        // const request;
        // //delete document if present:
        //
        // //add document:
        // documentController.postDocumentRoute()
        //
        // //get document:
        // documentController.getDocumentsRoute()
        //     .then((documents)=> {
        //         expect(documents.length).toBe(1);
        //         expect(documents[0].doc_name).toBe("TestingDocument.pdf");
        //         expect(documents[0].mimetype).toBe("pdf");
        //         expect(documents[0].encoding).toBe("7-bit");
        //         expect(documents[0].size).toBe(600000);
        //     })
        //     .catch(err => {
        //         throw err;
        //     });
    });
});