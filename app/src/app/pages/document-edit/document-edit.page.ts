/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';

import { ModalController, NavParams, Platform, PopoverController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import {WorkFlowService} from 'src/app/Services/Workflow/work-flow.service';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import WebViewer from '@pdftron/webviewer';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';


@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.page.html',
  styleUrls: ['./document-edit.page.scss'],
})
export class DocumentEditPage implements OnInit, AfterViewInit {
  srcFile: any;
  srcFileBase64: any;
  pdfDoc: PDFDocument;
  showAnnotations = false;
  annotationManager: any;
  documentViewer: any;
  documentMetadata: any;

  @Input('documentname') docName: string;
  @Input('workflowId') workflowId: string;
  @ViewChild('viewer') viewerRef: ElementRef;
  @Input('userEmail') userEmail: string;
  constructor(
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService,
    private pop: PopoverController,
  ) {}

  async ngOnInit() {
    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
      this.docName = data['documentname'];
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
        this.srcFileBase64 = response.data.filedata.Body.data;
        const arr = new Uint8Array(response.data.filedata.Body.data);
        const blob = new Blob([arr], {type: 'application/pdf'});

        this.pdfDoc = await PDFDocument.load(arr);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
        WebViewer({
          path: './../../../assets/lib',
          annotationUser: this.userEmail
        }, this.viewerRef.nativeElement).then(instance =>{

          this.annotationManager = instance.Core.annotationManager;
          this.documentViewer = instance.Core.documentViewer;

          instance.UI.loadDocument(blob, {filename: this.docName});
          instance.UI.disableElements(['toolbarGroup-Annotate']);
          instance.UI.setHeaderItems(header =>{
            header.push({
              type: 'actionButton',
              // eslint-disable-next-line max-len
              img: '<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'ionicon\' viewBox=\'0 0 512 512\'><title>Eye</title><path d=\'M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'/><circle cx=\'256\' cy=\'256\' r=\'80\' fill=\'none\' stroke=\'currentColor\' stroke-miterlimit=\'10\' stroke-width=\'32\'/></svg>',
              onClick: () =>  { this.toggleAnnotations(instance.Core.annotationManager);
              }
            });
          });
          instance.Core.documentViewer.addEventListener('documentLoaded', ()=>{
            instance.Core.annotationManager.importAnnotations(response.data.annotations);
          });

          instance.UI.setHeaderItems(header =>{
            header.push({
              type: 'actionButton',
              img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
              onClick: async () => {
                const xfdfString = await  instance.Core.annotationManager.exportAnnotations();
                await this.updateDocumentAnnotations(xfdfString);
              }
            });
          });

        });
      }else {


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

  toggleAnnotations(annotationManager){

    this.showAnnotations = !this.showAnnotations;
    const annotations = annotationManager.getAnnotationsList();
    if(this.showAnnotations){
      //annotManager.showAnnotations(annotations); //use if you wihs to hide the associated comments that go with an annotation as well as the annotation.
      annotations.forEach(annot =>{
        annot.Hidden = false;
      });
    }
    else{
      //annotManager.hideAnnotations(annotations);
      annotations.forEach(annot =>{
        annot.Hidden = true;
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
    await this.userApiService.displayPopOverWithButtons('Go back','Are you sure you want to go back? Any unsaved changes will be lost.', (response) =>{
      if(response.data.confirm === true)
        this.router.navigate(['home']);
    });
  }

  async acceptDocument(){
    await this.userApiService.displayPopOverWithButtons('signPhase','Do you accept this phase', (response) =>{
      console.log(response);
    });
   }

  async updateDocumentAnnotations(annotationsString){
    await this.workflowService.updateCurrentPhaseAnnotations(this.workflowId, annotationsString, (response)=>{
      console.log(response);
    });
  }
}
