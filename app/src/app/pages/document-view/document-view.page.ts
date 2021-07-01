/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { ModalController, NavParams, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import { async } from '@angular/core/testing';
import { ConfirmSignaturesComponent } from 'src/app/components/confirm-signatures/confirm-signatures.component';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {DomSanitizer} from "@angular/platform-browser";


@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit {
  srcFile: any;
  rotated: number;
  setZoom: any;
  zoomLevel: number;
  pdfDoc: PDFDocument;
  ready: boolean;



  @Input('id') id: string;
  @Input('documentname') docName: string;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.ready = false;
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel=1;
    await this.route.params.subscribe(stuff =>{
      this.id = stuff['id'];
      this.docName = stuff['documentname'];
    });
    await (this.getDocument(this.id));
  }

  download() {
    const blob = new Blob([this.srcFile], {type: 'application/pdf'});
    const objUrl = URL.createObjectURL(blob);


    var link = document.createElement('a');
    link.href = objUrl;
    link.download = this.docName;
    document.body.appendChild(link);

    link.click();
    link.remove();
  }

  back(){
    this.router.navigate(['home']);
  }


  async getDocument(id: string){
    this.docApi.getDocument(id, async (response)=>{
      if (response){
        const buff = response.data.filedata.Body.data; //wut
        const a  = new Uint8Array( buff);

        this.pdfDoc = await PDFDocument.load(a);
        const pages = this.pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        const helveticaFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
        firstPage.drawText('This text was added with JavaScript!', {
          x: 60,
          y: height / 2 + 300,
          size: 50,
          font: helveticaFont,
          color: rgb(0.5, 0.2, 0.7),
          rotate: degrees(0),
        });
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;

        var blob = new Blob([pdfBytes], {type: 'application/pdf;base64'});
        console.log(blob.arrayBuffer());
        const obj = URL.createObjectURL(blob);
        console.log(obj);
        this.srcFile = this.sanitizer.bypassSecurityTrustResourceUrl(obj);
        this.ready = true;
      }else{

      }
    });
  }

  test(){
    console.log("A click was recieved");
  }

  async printMousePosition(event){
    console.log("X: ", event.clientX, " Y: ", event.clientY);
    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    const helveticaFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    firstPage.drawText('This text was added with JavaScript!', {
      x: event.clientX,
      y: height / 2 + 300,
      size: 50,
      font: helveticaFont,
      color: rgb(0.5, 0.2, 0.7),
      rotate: degrees(0),
    });
    const pdfBytes = await this.pdfDoc.save();
    this.srcFile = pdfBytes;
  }

  async sign(){
    const sign = this.modalCtrl.create({
      component: ConfirmSignaturesComponent
    });

   (await sign).present();

    const data =  (await sign).onDidDismiss();
    if(await (await data).data['confirm']){
      this.addSignature();
    }
  }

  rotation(){
    this.rotated += 90;
    if(this.rotated === 360){
      this.rotated =0;
    }
  }

  setZoomWidth(){
    this.setZoom ='page-width';
    console.log('width');
  }

  setZoomFit(){
    this.setZoom ='page-fit';
    console.log('fit');
  }

  setZoomHeight(){
    this.setZoom ='page-height';
    console.log('height');
  }

  zoomIn(){
    this.zoomLevel += 0.25;
    console.log('in');
  }

  zoomOut(){
    this.zoomLevel -=0.25;
    console.log('out');
  }

  addSignature(){
    console.log('here');
  }
}
