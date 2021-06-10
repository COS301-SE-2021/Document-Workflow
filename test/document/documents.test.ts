// import sinon from "sinon";
// import DocumentController from "../../src/document/DocumentController";
// import DocumentRepository from "../../src/document/DocumentRepository";
// import DocumentService from "../../src/document/DocumentService";
//
// describe("DocumentController: ", () => {
//    let documentService;
//
//    beforeEach(()=>{
//        documentService = new DocumentService(new DocumentRepository());
//    });
//
//    test("Zero Documents Found: ", () => {
//        sinon.stub(documentService, "getDocuments").returns([]);
//        const documentController = new DocumentController(documentService);
//        const documents = documentController.getDocumentsRoute();
//        expect(documents.length).toBe(0);
//     });
//
//    test("One Document Found: ", () => {
//       sinon.stub(documentService, "getDocuments").returns([{
//           doc_name: "TestingDocument.pdf",
//           mimetype: "pdf",
//           encoding: "7-bit",
//           size: 600000
//       }]);
//       const documentController = new DocumentController(documentService);
//       const documents = documentController.getDocumentsRoute();
//       expect(documents.length).toBe(1);
//       expect(documents[0].doc_name).toBe("TestingDocument.pdf");
//       expect(documents[0].mimetype).toBe("pdf");
//       expect(documents[0].encoding).toBe("7-bit");
//       expect(documents[0].size).toBe(600000);
//    });
//
// });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// // import chai from "chai";
// // import chaiHttp from "chai-http";
// // import mongoose from "mongoose";
// // import app from "../../src/index";
// //
// // chai.use(chaiHttp);
// // chai.should();
// //
// // describe("Documents", () => {
// //     describe("POST /api/documents", () => {
// //         it("should insert a document into the db from body content", (done) => {
// //             chai.request(app)
// //                 .post("/api/documents")
// //                 .set('Content-Type', 'application/pdf')
// //                 .field('name', 'someFileOrRather2.pdf')
// //                 .field('mimetype', 'pdf')
// //                 .field('size', 501414)
// //                 .field('encoding', 'gzip')
// //                 .attach('file', "./test/user/someFileOrRather2.pdf", 'someFileOrRather2.pdf')
// //                 .end( (err,res) => {
// //                     //console.log(res);
// //                     res.should.have.status(200);
// //                     mongoose.disconnect();
// //                     done();
// //                 })
// //         })
// //     });
// // });