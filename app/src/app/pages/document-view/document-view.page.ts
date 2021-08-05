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
import WebViewer from '@pdftron/webviewer';
import {UserNotificationsComponent} from "../../components/user-notifications/user-notifications.component";
import {DocumentActionAreaComponent} from "../../components/document-action-area/document-action-area.component";
import {ErrorOccurredComponent} from "../../components/error-occurred/error-occurred.component";

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
  @Input('userEmail') userEmail: string;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workFlowService: WorkFlowService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.route.params.subscribe((data) => {
      this.documentId = data['id'];
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
    await this.docApi.getDocument(this.documentId, async (response) => {
      if (response) {
        this.srcFileBase64 = response.data.filedata.Body.data;
        const arr = new Uint8Array(response.data.filedata.Body.data);
        const blob = new Blob([arr], {type: 'application/pdf'});

        this.pdfDoc = await PDFDocument.load(arr);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
        WebViewer({
          path: '../../../assets/lib',
          annotationUser: this.userEmail
        }, this.viewerRef.nativeElement).then(instance =>{

            instance.UI.loadDocument(blob, {filename: this.docName});
            instance.UI.disableElements(['ribbons']);
            instance.UI.setToolbarGroup('toolbarGroup-View',false);
            instance.UI.setHeaderItems(header =>{
              header.push({
                type: 'actionButton',
                img: '<svg xmlns=\'http://www.w3.org/2000/svg\' class=\'ionicon\' viewBox=\'0 0 512 512\'><title>Eye</title><path d=\'M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z\' fill=\'none\' stroke=\'currentColor\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'32\'/><circle cx=\'256\' cy=\'256\' r=\'80\' fill=\'none\' stroke=\'currentColor\' stroke-miterlimit=\'10\' stroke-width=\'32\'/></svg>',
                onClick: () =>  { this.toggleAnnotations(instance.Core.annotationManager);
                }
              });
         });
        });
      }else {
        //TODO: style this ErrorOccurredPopup
        const a = await this.modalCtrl.create({
          component: ErrorOccurredComponent,
          componentProps: {
            title: "An error occurred",
            message: "Please try again later"
          },
        });

        await (await a).present();
        (await a).onDidDismiss().then(async (data) => {
        });
      }
    });
    //TODO: style this ErrorOccurredPopup
    const a = await this.modalCtrl.create({
      component: ErrorOccurredComponent,
      componentProps: {
      },
      cssClass: 'errorModalClass'
    });

    await (await a).present();
    (await a).onDidDismiss().then(async (data) => {
    });
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
}
