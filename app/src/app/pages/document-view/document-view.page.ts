/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { ModalController, NavParams, Platform } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import {WorkFlowService} from 'src/app/Services/Workflow/work-flow.service';
import {PDFDocument} from 'pdf-lib';
import WebViewer, {Core} from '@pdftron/webviewer';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit, AfterViewInit {
  srcFile: any;
  srcFileBase64: any;
  pdfDoc: PDFDocument;
  showAnnotations = true;
  annotationManager: any;
  instance : any;
  documentViewer: any;
  documentMetadata: any;
  originalKeywords: string;
  hash: string;
  annotationSubjects = ['Note', 'Rectangle', 'Squiggly', 'Underline', 'Highlight', 'Strikeout'];

  @Input('workflowStatus') workflowStatus:string;
  @Input('documentname') docName: string;
  @Input('workflowId') workflowId: string;
  @ViewChild('viewer') viewerRef: ElementRef;
  @Input('userEmail') userEmail: string;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService
  ) {}

  async ngOnInit() {
    this.originalKeywords = '';
    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
      //this.docName = data['documentname'];
      this.workflowStatus = data['status'];
      this.userEmail = data['userEmail'];
    });
  }

  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  async ngAfterViewInit(): Promise<void>{
    await this.workflowService.retrieveDocument(this.workflowId, async (response) => {
      console.log(response);
      if (response) {

        this.documentMetadata = response.data.metadata;
        this.docName = this.documentMetadata.name;
        this.srcFileBase64 = response.data.filedata.Body.data;
        this.hash = response.data.hash;
        const arr = new Uint8Array(response.data.filedata.Body.data);

        const blob = new Blob([arr], {type: 'application/pdf'});

        this.pdfDoc = await PDFDocument.load(arr);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
        WebViewer({
          path: './../../../assets/lib',
          annotationUser: this.userEmail,
          fullAPI: true,
          isReadOnly: true
        }, this.viewerRef.nativeElement).then(async instance =>{
          this.instance = instance; 
          await instance.Core.PDFNet.initialize(); //To use pdftron in the non-demo mode supply a licence key here
            /*Test to add metadata to document */
            const docorig = await instance.Core.PDFNet.PDFDoc.createFromBuffer(arr);
            const doc = await docorig.getSDFDoc();
            doc.initSecurityHandler();
            doc.lock();
            console.log('Modifying into dictionary, adding custom properties, embedding a stream...');
  
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
                console.log('Keywords already present');
                const itrval = await itr.value();
                const oldstr = await itrval.getAsPDFText();
                this.originalKeywords = oldstr;
                info.putText('Keywords', oldstr + ' - ' + this.hash);
              } else {
                console.log('No previous keywords present');
                info.putString('Keywords', this.hash);
              }
            } else {
              console.log('Info dict missing, adding it now');
              // Info dict is missing.
              info = await trailer.putDict('Info');
              info.putString('Producer', 'PDFTron PDFNet');
              info.putString('Title', 'My document');
              info.putString('Keywords', this.hash);
            }
            const customDict = await info.putDict('My Direct Dict');
            customDict.putNumber('My Number', 100); 
            const docbuf = await doc.saveMemory(0, '%PDF-1.4'); 
            let blob2 = new Blob([new Uint8Array(docbuf)], {type: 'application/pdf'});
            /*   */

            await instance.Core.PDFNet.initialize(); //To use pdftron in the non-demo mode supply a licence key here
            this.annotationManager = instance.Core.annotationManager;
            this.documentViewer = instance.Core.documentViewer;
            const documentTest = await instance.Core.createDocument(blob2, {filename: this.docName});
            console.log('Document Metadata----------------------------');
            console.log(await documentTest.getMetadata());

            instance.UI.loadDocument(blob2, {filename: this.docName});
            instance.UI.disableElements(['ribbons']);
            instance.UI.setToolbarGroup('toolbarGroup-View',false);
            if(this.workflowStatus !== 'Completed'){ 
            instance.UI.setHeaderItems(header =>{
              header.push({
                type: 'actionButton',
                // eslint-disable-next-line max-len
                img: '<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'ionicon\' viewBox=\'0 0 512 512\'><title>Eye</title><path d=\'M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'/><circle cx=\'256\' cy=\'256\' r=\'80\' fill=\'none\' stroke=\'currentColor\' stroke-miterlimit=\'10\' stroke-width=\'32\'/></svg>',
                onClick: () =>  { this.toggleAnnotations(instance.Core.annotationManager);
                }
              });
         });
        }

         if(this.workflowStatus !== 'Completed'){ 
          instance.UI.setHeaderItems(header =>{
            header.push({
              type: 'actionButton',
              img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
              onClick: async () => {
                const xfdfString = await  instance.Core.annotationManager.exportAnnotations();
                 await this.acceptDocument();
              }
            });
          });
        }

            instance.Core.documentViewer.addEventListener('documentLoaded', async ()=>{
              //For now, to work around not having full api functions with the free version of PDFTron
              //We disable the action areas from showing through a check of the workflow status
              //This is to ensure pringint of the document does not include action areas.
              console.log(this.workflowStatus);
              if(this.workflowStatus !== 'Completed'){ //TODO: swap with enum
                instance.Core.annotationManager.importAnnotations(response.data.annotations);
              }
            });

        });
      }else {
        //TODO: style this ErrorOccurredPopup

        await this.userApiService.displayPopOver('Oops','An unexpected error occurred. Please try again later');
        // const a = await this.modalCtrl.create({
        //   component: ErrorOccurredComponent,
        //   componentProps: {
        //   },
        //   cssClass: 'errorModalClass'
        // });

        // await (await a).present();
        // (await a).onDidDismiss().then(async (data) => {
        // });
      }
    });
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
  async back() {
    await this.userApiService.displayPopOverWithButtons('Go back','Are you sure you want to go back? Any unsaved changes will be lost.', (response) =>{
      if(response.data.confirm === true)
        this.router.navigate(['home']);
    });
  }

  async acceptDocument(){
    await this.userApiService.displayPopOverWithButtons('Accept Phase','Do you accept this phase as complete?', async (response) =>{
      await this.updateDocumentAnnotations(await this.annotationManager.exportAnnotations());
      
      
      const data = await this.documentViewer.getDocument().getFileData({});
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      const file = new File([blob], this.documentMetadata.name);

      await this.workflowService.updatePhase(this.workflowId, response.data.confirm, file, (response2) => {
        console.log(response2);
      });
    });
   }

  toggleAnnotations(annotationManager){
    console.log("TToggling annotations");
    this.showAnnotations = !this.showAnnotations;
    const annotations = annotationManager.getAnnotationsList();
    if(this.showAnnotations){
      //annotManager.showAnnotations(annotations); //use if you wihs to hide the associated comments that go with an annotation as well as the annotation.
      annotations.forEach(annot =>{
        this.annotationSubjects.forEach(a =>{
          if(a === annot.Subject)
            annot.Hidden = false;
        });

      });
    }
    else{
      //annotManager.hideAnnotations(annotations);
      annotations.forEach(annot =>{
        this.annotationSubjects.forEach(a =>{
          if(a === annot.Subject)
            annot.Hidden = true;
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
  removeActionAreasFromAnnotations(){

    const toDelete = [];
    this.annotationManager.getAnnotationsList().forEach(annot =>{
      this.annotationSubjects.forEach(a =>{
        if(a === annot.Subject) {
          toDelete.push(annot);
        }
      });
    });
    this.annotationManager.deleteAnnotations(toDelete);
  }

  async updateDocumentAnnotations(annotationsString){
      console.log("Updating the annotations of this document");
      this.workflowService.displayLoading();
      await this.workflowService.updateCurrentPhaseAnnotations(this.workflowId, annotationsString, (response)=>{
        console.log(response);

        if(response.status === "success"){
          this.userApiService.displayPopOver("Success", "Your response has been saved");
          this.router.navigate(['home']);
        }

        this.workflowService.dismissLoading();
      });
  }
}
