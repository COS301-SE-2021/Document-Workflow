/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { ModalController, NavParams, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import {WorkFlowService} from 'src/app/Services/Workflow/work-flow.service';
import { async } from '@angular/core/testing';
import { ConfirmSignaturesComponent } from 'src/app/components/confirm-signatures/confirm-signatures.component';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DomSanitizer } from '@angular/platform-browser';
import WebViewer, {PDFNet} from '@pdftron/webviewer';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit, AfterViewInit {
  srcFile: any;
  srcFileBase64: any;
  pdfDoc: PDFDocument;
  showAnnotations = false;

  @Input('id') documentId: string;
  @Input('documentname') docName: string;
  @Input('workflowId') workflowId: string;
  @ViewChild('viewer') viewerRef: ElementRef;
  //TODO: get the name of the person who is editing/viewing the document
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workFlowService: WorkFlowService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.route.params.subscribe((stuff) => {
      this.documentId = stuff['id'];
      this.docName = stuff['documentname'];
    });
  }

  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  async ngAfterViewInit(): Promise<void>{
    await this.docApi.getDocument(this.documentId, async (response) => {
      if (response) {
        this.srcFileBase64 = response.data.filedata.Body.data;
        const arr = new Uint8Array(response.data.filedata.Body.data);
        const blob = new Blob([arr], { type: 'application/pdf' });

        this.pdfDoc = await PDFDocument.load(arr);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;

        WebViewer({
          path: '../../assets/lib',
          annotationUser: "Temporary User"
        }, this.viewerRef.nativeElement)
          .then(async instance => {
            //Look at the Callout tool of the insert bar as well as the stickers that can be inserted.
            console.log(instance);

            instance.loadDocument(blob, {filename: this.docName});

            const { docViewer, annotManager, CoreControls} = instance;
            instance.disableElements(['toolbarGroup-Shapes']);
            instance.disableElements(['toolbarGroup-Edit']);
            instance.disableElements(['toolbarGroup-Insert']);

            // Add header button that will get file data on click
            instance.setHeaderItems(header => {
              header.getHeader('toolbarGroup-Annotate').delete('highlightToolGroupButton');
              header.getHeader('toolbarGroup-Annotate').delete('underlineToolGroupButton');
              header.getHeader('toolbarGroup-Annotate').delete('strikeoutToolGroupButton');
              header.getHeader('toolbarGroup-Annotate').delete('squigglyToolGroupButton');
              header.getHeader('toolbarGroup-Annotate').delete('freeTextToolGroupButton');
              header.getHeader('toolbarGroup-Annotate').delete('freeHandToolGroupButton');

              header.push({
                type: 'actionButton',
                img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                onClick: () =>  { this.toggleAnnotations(annotManager);
                }
              });

              header.push({
                type: 'actionButton',
                img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
                onClick: async () => {
                  const doc = docViewer.getDocument();
                  const xfdfString = await annotManager.exportAnnotations();
                  const saveOptions = CoreControls.SaveOptions;
                  const options = {
                    xfdfString,
                    flags: saveOptions.LINEARIZED,
                    downloadType: 'pdf'
                  };
                  const data = await doc.getFileData(options);
                  const arr2 = new Uint8Array(data);
                  const blob2 = new Blob([arr2], { type: 'application/pdf' });
                  const file = new File([blob2], this.docName,{type:'application/pdf', lastModified:new Date().getTime()});
                  console.log(file);
                  this.workFlowService.updateDocument(this.documentId, file, (res) =>{
                    console.log(res);
                  });

                }
              });

            });

            docViewer.on('documentLoaded', () => {
            });

          });


      } else {
      }
    });

  }


  toggleAnnotations(annotManager){

    this.showAnnotations = !this.showAnnotations;
    const annotations = annotManager.getAnnotationsList();

    if(this.showAnnotations){
      console.log("Showing annotations");
      annotManager.showAnnotations(annotations);
    }
    else{
      console.log("Hiding annotations");
      //annotManager.hideAnnotations(annotations);
      annotations.forEach(annot =>{
        annot.Hidden = true;
      });
    }

    annotManager.drawAnnotationsFromList(annotations);
  }

  download() {
    const blob = new Blob([this.srcFile], { type: 'application/pdf' });
    const objUrl = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.href = objUrl;
    link.download = this.docName;
    document.body.appendChild(link);

    link.click();
    link.remove();
  }

  back() {
    this.router.navigate(['home']);
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
}
