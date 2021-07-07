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
import { async } from '@angular/core/testing';
import { ConfirmSignaturesComponent } from 'src/app/components/confirm-signatures/confirm-signatures.component';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DomSanitizer } from '@angular/platform-browser';
import WebViewer, {PDFNet} from '@pdftron/webviewer';
import * as fs from 'fs';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit, AfterViewInit {
  srcFile: any;
  srcFileBase64: any;
  rotated: number;
  setZoom: any;
  zoomLevel: number;
  pdfDoc: PDFDocument;

  @Input('id') id: string;
  @Input('documentname') docName: string;
  @ViewChild('viewer') viewerRef: ElementRef;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel = 1;
    await this.route.params.subscribe((stuff) => {
      this.id = stuff['id'];
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
    this.docApi.getDocument(this.id, async (response) => {
      if (response) {
        const buff = response.data.filedata.Body.data;
        this.srcFileBase64 =response.data.filedata.Body.data;
        const a = new Uint8Array(buff);

        this.pdfDoc = await PDFDocument.load(a);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;

        console.log(this.srcFileBase64);
        function base64ToBlob(base64) {
          const binaryString = window.atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; ++i) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          return new Blob([bytes], { type: 'application/pdf' });
        };

        WebViewer({
          path : '../../assets/lib'
        }, this.viewerRef.nativeElement)
          .then(instance => {

            // `myBase64String` is your base64 data which can come
            // from sources such as a server or the filesystem
            instance.loadDocument(this.srcFile, { filename: 'myfile.pdf' });

            const { docViewer } = instance;
            docViewer.on('documentLoaded', () => {
              // perform document operations
            });
          });

      } else {
      }
    });


    /*
    await this.getDocument(this.id);
    WebViewer({
      path:'',
      initialDoc: this.srcFile
    }, this.viewerRef.nativeElement).then(instance=>{

    });
    */

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
    this.docApi.getDocument(id, async (response) => {
      if (response) {
        const buff = response.data.filedata.Body.data;
        this.srcFileBase64 =response.data.filedata.Body.data;
        const a = new Uint8Array(buff);

        this.pdfDoc = await PDFDocument.load(a);
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
      } else {
      }
    });
  }

  async printBrentIdea(event) {

    let canvas = document.getElementsByTagName("canvas")[0];
    let scroll_div = document.getElementsByTagName("pdf-viewer")[0].children[0];
    console.log(scroll_div);
    canvas.addEventListener('mousemove', function(even3){
      console.log(even3);
    });

    scroll_div.addEventListener('scroll', (even3)=>{
      console.log("Scroll: ", scroll_div.scrollTop);
    });

    let xCanvas = document.getElementsByTagName('canvas')[0].style.width;
    let x = parseInt(xCanvas.substring(0, xCanvas.length - 2));
    let yCanvas = document.getElementsByTagName('canvas')[0].style.height;
    let y = parseInt(yCanvas.substring(0, yCanvas.length - 2)) + scroll_div.scrollTop;
    //todo check boundaries
    let widthOfScreen =
      document.getElementsByTagName('canvas')[0].parentElement.parentElement
        .parentElement.parentElement.clientWidth;
    let widthOffset = (widthOfScreen - x) / 2;

    console.log('full width: ' + widthOfScreen);
    console.log('offset width: ' + widthOffset);

    let pdfBytes = await this.pdfDoc.save();
    this.pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    console.log(width + ' ' + height);
    const helveticaFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

    let ratio =0
    if (widthOffset > 1) {
      ratio = (widthOffset/x)* width;
    }

    let xCoord = (event.clientX * width) / x - ratio;
    let yCoord = ((y - event.clientY) / y) * height + 30 / this.zoomLevel;

    firstPage.drawText('X', {
      x: xCoord,
      y: yCoord,
      size: 25,
      font: helveticaFont,
      color: rgb(0.5, 0.2, 0.7),
      rotate: degrees(0),
    });
    pdfBytes = await this.pdfDoc.save();
    this.srcFile = pdfBytes;
  }



  async printMousePosition(event) {
    console.log('X: ', event.clientX, ' Y: ', event.clientY);
    let canvas = document.getElementsByTagName("canvas")[0];
    let scroll_div = document.getElementsByTagName("pdf-viewer")[0].children[0];

    let pdfBytes = await this.pdfDoc.save();
    this.pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    const helveticaFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

    firstPage.drawText('X', {
      x: event.clientX,
      y: height - event.clientY - scroll_div.scrollTop,
      size: 50,
      font: helveticaFont,
      color: rgb(0.5, 0.2, 0.7),
      rotate: degrees(0),
    });
    pdfBytes = await this.pdfDoc.save();
    this.srcFile = pdfBytes;
  }

  async sign() {
    const sign = this.modalCtrl.create({
      component: ConfirmSignaturesComponent,
    });

    (await sign).present();

    const data = (await sign).onDidDismiss();
    if (await (await data).data['confirm']) {
      this.addSignature();
    }
  }

  rotation() {
    this.rotated += 90;
    if (this.rotated === 360) {
      this.rotated = 0;
    }
  }

  setZoomWidth() {
    this.setZoom = 'page-width';
    console.log('width');
  }

  setZoomFit() {
    this.setZoom = 'page-fit';
    console.log('fit');
  }

  setZoomHeight() {
    this.setZoom = 'page-height';
    console.log('height');
  }

  zoomIn() {
    this.zoomLevel += 0.25;
    console.log('in');
  }

  zoomOut() {
    this.zoomLevel -= 0.25;
    console.log('out');
  }

  addSignature() {
    console.log('here');
  }
}
