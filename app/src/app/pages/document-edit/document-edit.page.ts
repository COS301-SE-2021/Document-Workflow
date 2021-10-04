/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';

import {
  ModalController,
  NavParams,
  Platform,
  PopoverController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import WebViewer from '@pdftron/webviewer';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { AutoFillComponent } from 'src/app/components/auto-fill/auto-fill.component';
import {input} from "@tensorflow/tfjs";

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.page.html',
  styleUrls: ['./document-edit.page.scss'],
})
export class DocumentEditPage implements OnInit, AfterViewInit {
  srcFile: any;
  srcFileBase64: any;
  pdfDoc: PDFDocument;
  showAnnotations = true;
  showautofilled = true;
  annotationManager: any;
  annotationsString: string;
  documentViewer: any;
  PDFNet: any;
  instance: any;
  doc: any;
  extractedLines;
  documentMetadata: any;
  hash: string;
  originalKeywords: string;
  actionAreas: [];
  autoFilledAnnots = [];
  //This array is used to determine what annotations are and are not a part of action areas.
  //It is here in case the stakeholders of this project decide they want more action areas as part of the application
  annotationSubjects = ['Note']; //, 'Rectangle', 'Squiggly', 'Underline', 'Highlight', 'Strikeout'];

  @Input('documentname') docName: string;
  @Input('workflowId') workflowId: string;
  @ViewChild('viewer') viewerRef: ElementRef;
  @Input('userEmail') userEmail: string;
  constructor(
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService,
    private modal: ModalController
  ) {}

  async ngOnInit() {
    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
      this.userEmail = data['userEmail'];
    });
    this.userApiService.checkIfAuthorized().subscribe(
      (response) => {
      },
      async (error) => {
        await this.router.navigate(['/login']);
        return;
      }
    );
  }

  toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  async ngAfterViewInit(): Promise<void> {
    await this.workflowService.retrieveDocument(
      this.workflowId,
      async (response) => {
        if (response) {
          this.documentMetadata = response.data.metadata;
          this.docName = this.documentMetadata.name;
          this.srcFileBase64 = response.data.filedata.Body.data;
          this.hash = response.data.hash;
          const arr = new Uint8Array(response.data.filedata.Body.data);
          const blob = new Blob([arr], { type: 'application/pdf' });

          this.pdfDoc = await PDFDocument.load(arr);
          const pdfBytes = await this.pdfDoc.save();
          this.srcFile = pdfBytes;
          WebViewer(
            {
              path: './../../../assets/lib',
              annotationUser: this.userEmail,
              fullAPI: true,
            },
            this.viewerRef.nativeElement
          ).then(async (instance) => {
            await instance.Core.PDFNet.initialize(); //To use pdftron in the non-demo mode supply a licence key here
            instance.UI.setCustomNoteFilter(
              (annot) =>
                annot instanceof instance.Core.Annotations.StickyAnnotation
            );
            this.annotationManager = instance.Core.annotationManager;
            this.PDFNet = instance.Core.PDFNet;
            this.documentViewer = instance.Core.documentViewer;
            const docorig = await instance.Core.PDFNet.PDFDoc.createFromBuffer(
              arr
            );
            const doc = await docorig.getSDFDoc();
            doc.initSecurityHandler();
            doc.lock();
            const trailer = await doc.getTrailer(); // Get the trailer

            let itr = await trailer.find('Info');
            let info;
            if (await itr.hasNext()) {
              info = await itr.value();
              // Modify 'Producer' entry.
              info.putString('Producer', 'PDFTron PDFNet');

              // read title entry if it is present
              itr = await info.find('Keywords');
              if (await itr.hasNext()) {
                const itrval = await itr.value();
                const oldstr = await itrval.getAsPDFText();
                this.originalKeywords = oldstr;
                info.putText('Keywords', this.hash);
              } else {
                info.putString('Keywords', this.hash);
              }
            } else {
              // Info dict is missing.
              info = await trailer.putDict('Info');
              info.putString('Producer', 'PDFTron PDFNet');
              info.putString('Title', 'My document');
              info.putString('Keywords', this.hash);
            }
            const customDict = await info.putDict('My Direct Dict');
            customDict.putNumber('My Number', 100);
            const docbuf = await doc.saveMemory(0, '%PDF-1.4');
            let blob2 = new Blob([new Uint8Array(docbuf)], {
              type: 'application/pdf',
            });

            instance.UI.loadDocument(blob2, { filename: this.docName });
            instance.UI.disableElements(['toolbarGroup-Annotate']);
            instance.UI.setToolbarGroup('toolbarGroup-Insert', false);
            instance.UI.setHeaderItems(async (header) => {
              header.push({
                type: 'actionButton',
                // eslint-disable-next-line max-len
                img: "<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 20 20'><title>Eye</title><path d='M18.303,4.742l-1.454-1.455c-0.171-0.171-0.475-0.171-0.646,0l-3.061,3.064H2.019c-0.251,0-0.457,0.205-0.457,0.456v9.578c0,0.251,0.206,0.456,0.457,0.456h13.683c0.252,0,0.457-0.205,0.457-0.456V7.533l2.144-2.146C18.481,5.208,18.483,4.917,18.303,4.742 M15.258,15.929H2.476V7.263h9.754L9.695,9.792c-0.057,0.057-0.101,0.13-0.119,0.212L9.18,11.36h-3.98c-0.251,0-0.457,0.205-0.457,0.456c0,0.253,0.205,0.456,0.457,0.456h4.336c0.023,0,0.899,0.02,1.498-0.127c0.312-0.077,0.55-0.137,0.55-0.137c0.08-0.018,0.155-0.059,0.212-0.118l3.463-3.443V15.929z M11.241,11.156l-1.078,0.267l0.267-1.076l6.097-6.091l0.808,0.808L11.241,11.156z' stroke='currentColor'></path></svg>",
                onClick: () => {
                  this.deleteAutoFilled();
                  //this.toggleAutofilled(instance.Core.annotationManager);
                },
              });

              header.push({
                type: 'actionButton',
                // eslint-disable-next-line max-len
                img: "<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><title>Eye</title><path d='M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z' fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='32'/><circle cx='256' cy='256' r='80' fill='none' stroke='currentColor' stroke-miterlimit='10' stroke-width='32'/></svg>",
                onClick: () => {
                  this.toggleAnnotations(instance.Core.annotationManager);
                },
              });
            });

            this.doc = await this.PDFNet.PDFDoc.createFromBuffer(arr);
            this.instance = instance;
            instance.Core.documentViewer.addEventListener(
              'documentLoaded',
              async () => {
                this.annotationsString = response.data.annotations;
                await instance.Core.annotationManager.importAnnotations(
                  response.data.annotations
                );

                //await this.fill(instance, instance.Core.PDFNet, this.doc, 'good', 'Test');
              }
            );

            instance.UI.setHeaderItems((header) => {
              header.push({
                type: 'actionButton',
                img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                onClick: async () => {
                  await this.acceptDocument();
                },
              });
            });
          });
        } else {
        }
      }
    );
  }

  async extractDocumentText(doc, PDFNet) {
    let extractedText = '';
    /*Testing if we can retrieve hash stored in a document*/
    const doc1 = await doc.getSDFDoc();
    doc1.initSecurityHandler();
    doc1.lock();

    /*    */
    const txt = await PDFNet.TextExtractor.create();
    const pageCount = await doc.getPageCount();
    for (let i = 1; i <= pageCount; ++i) {
      const page = await doc.getPage(i);
      const rect = await page.getCropBox();
      txt.begin(page, rect); // Read the page.
      extractedText += await txt.getAsText();
    }
    doc1.unlock();
    return extractedText;
  }

  download() {
    const blob = new Blob([this.srcFile], { type: 'application/pdf' });
    const objUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objUrl;
    link.download = this.docName;
    document.body.appendChild(link);

    link.click();
    link.remove();
  }

  toggleAnnotations(annotationManager) {
    this.showAnnotations = !this.showAnnotations;
    const annotations = annotationManager.getAnnotationsList();
    if (this.showAnnotations) {
      //annotManager.showAnnotations(annotations); //use if you wihs to hide the associated comments that go with an annotation as well as the annotation.
      annotations.forEach((annot) => {
        this.annotationSubjects.forEach((a) => {
          if (a === annot.Subject) annot.Hidden = false;
        });
      });
    } else {
      //annotManager.hideAnnotations(annotations);
      annotations.forEach((annot) => {
        this.annotationSubjects.forEach((a) => {
          if (a === annot.Subject) annot.Hidden = true;
        });
      });
    }
    annotationManager.drawAnnotationsFromList(annotations);
  }

  async getDocument(id: string) {
    await this.docApi.getDocument(id, async (response) => {
      if (response) {
        const buff = response.data.filedata.Body.data;
        this.srcFileBase64 = response.data.filedata.Body.data;
        const a = new Uint8Array(buff);

        this.pdfDoc = await PDFDocument.load(a);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
      } else {
      }
    });
  }

  async back() {
    await this.userApiService.displayPopOverWithButtons(
      'Go back',
      'Are you sure you want to go back? Any unsaved changes will be lost.',
      (response) => {
        if (response.data.confirm === true) this.router.navigate(['home']);
      }
    );
  }

  async acceptDocument() {
    await this.userApiService.displayPopOverWithButtons(
      'signPhase',
      'Do you accept the phase as completed?',
      async (response) => {
        const nonNoteAnnots = this.removeNonActionAreasFromAnnotations();
        const commentedActionAreas =
          await this.annotationManager.exportAnnotations();
        this.annotationManager.addAnnotation(nonNoteAnnots);
        await this.removeActionAreasFromAnnotations();
        const xfdfString = await this.annotationManager.exportAnnotations();
        await this.removeAllAnnotations();

        //await this.annotationManager.drawAnnotationsFromList(await this.annotationManager.getAnnotationsList());
        await this.workflowService.updateCurrentPhaseAnnotations(
          this.workflowId,
          commentedActionAreas,
          async (response1) => {

            if (response1.status === 'success') {
              const options = { xfdfString: xfdfString, flatten: true };
              const data = await this.documentViewer
                .getDocument()
                .getFileData(options);

              const arr = new Uint8Array(data);
              const blob = new Blob([arr], { type: 'application/pdf' });
              const file = new File([blob], this.documentMetadata.name);

              await this.workflowService.updatePhase(
                this.workflowId,
                response.data.confirm,
                file,
                (response2) => {

                  if (response2.status === 'success') {
                    this.userApiService.displayPopOver(
                      'Success',
                      'The document has been edited'
                    );
                    this.router.navigate(['home']);
                  }
                }
              );
            }
          }
        );
      }
    );
  }

  removeActionAreasFromAnnotations() {
    const toDelete = [];
    this.annotationManager.getAnnotationsList().forEach((annot) => {
      this.annotationSubjects.forEach((a) => {
        if (a === annot.Subject) {
          toDelete.push(annot);
        }
      });
    });
    this.annotationManager.deleteAnnotations(toDelete);
    return toDelete;
  }

  removeNonActionAreasFromAnnotations() {
    const toDelete = [];
    this.annotationManager.getAnnotationsList().forEach((annot) => {
      this.annotationSubjects.forEach((a) => {
        if (a !== annot.Subject) {
          toDelete.push(annot);
        }
      });
    });
    this.annotationManager.deleteAnnotations(toDelete);
    return toDelete;
  }

  removeAllAnnotations() {
    const toDelete = [];
    this.annotationManager.getAnnotationsList().forEach((annot) => {
      this.annotationSubjects.forEach((a) => {
        toDelete.push(annot);
      });
    });
    this.annotationManager.deleteAnnotations(toDelete);
  }

  async updateDocumentAnnotations(annotationsString) {
    await this.workflowService.updateCurrentPhaseAnnotations(
      this.workflowId,
      annotationsString,
      (response) => {
      }
    );
  }

  async autofillKeywords() {
    //TODO: get keyword input and the value to fill with

    const keyword = 'Date:';
    const date = new Date();
    const value =
      date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    await this.fill(this.instance, this.PDFNet, this.doc, keyword, value);
  }

  async fill(instance, PDFNet, doc, keyword, value, fontSize='14') {
    const txtSearch = await PDFNet.TextSearch.create();
    let mode =
      PDFNet.TextSearch.Mode.e_whole_word +
      PDFNet.TextSearch.Mode.e_page_stop +
      PDFNet.TextSearch.Mode.e_highlight;

    txtSearch.begin(doc, keyword, mode);

    while (true) {
      let result = await txtSearch.run();
      if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
        let hlts = result.highlights;
        await hlts.begin(doc);

        const quadArr = await hlts.getCurrentQuads();
        const hltQuad = quadArr[0];
        const page = await doc.getPage(await hlts.getCurrentPageNumber());
        const ph = await page.getPageHeight();

        const freeText = new instance.Core.Annotations.FreeTextAnnotation();
        freeText.PageNumber = result.page_num;
        freeText.StrokeColor = new instance.Core.Annotations.Color(
          255,
          255,
          255,
          0
        );

        freeText.X = hltQuad.p2x;
        freeText.Y = ph - hltQuad.p3y;
        freeText.Width = 100;
        freeText.Height = 30;
        freeText.setContents(value);
        freeText.FillColor = new instance.Core.Annotations.Color(
          255,
          255,
          255,
          0
        );
        freeText.FontSize = fontSize + 'pt';
        freeText.TextColor = new instance.Core.Annotations.Color(0, 0, 0);
        this.autoFilledAnnots.push(freeText);

        await instance.Core.annotationManager.addAnnotation(freeText);
        await instance.Core.annotationManager.drawAnnotations({
          pageNumber: result.page_num,
        });
      } else if (result.code === PDFNet.TextSearch.ResultCode.e_page) {
      } else if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
        break;
      }
    }
  }


  async deleteAutoFilled(){
    for (const annot of this.autoFilledAnnots) {
      await this.annotationManager.deleteAnnotation(annot);
    }
    this.autoFilledAnnots = [];
  }
  /*
  async toggleAutofilled(annotationManager) {
    if (this.showautofilled) {
      console.log('Deleting autofilled annotations');
      for (const annot of this.autoFilledAnnots) {
        await annotationManager.deleteAnnotation(annot);
      }
      console.log(annotationManager.getAnnotationsList());
      console.log(this.autoFilledAnnots);
    } else {
      console.log('Adding autofilled fields');
      for (const annot of this.autoFilledAnnots) {
        await annotationManager.addAnnotation(annot);
      }
      console.log(annotationManager.getAnnotationsList());
    }
    this.showautofilled = !this.showautofilled;
  } */

  async showModal() {
    const a = await this.modal.create({
      component: AutoFillComponent,
    });

    await (await a).present();
    (await a).onDidDismiss().then(async (data) => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      if (data) {
        const flag = (await data).data['flag'];
        const inputText = (await data).data['inputText'];
        const fontSize = (await data).data['fontSize'];

        await this.fill(this.instance, this.PDFNet, this.doc, flag, inputText, fontSize);
      } else {
        //not delete
      }
    });
  }
}
