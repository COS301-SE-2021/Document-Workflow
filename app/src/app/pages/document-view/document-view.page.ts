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


  @Input('id') id: string;
  @Input('documentname') docName: string;
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
        const pdfBytes = await this.pdfDoc.save();
        this.srcFile = pdfBytes;
      }else{

      }
    });
  }

  async printBrentIdea(event){

    let xCanvas = document.getElementsByTagName('canvas')[0].style.width;
    let x = parseInt(xCanvas.substring(0, xCanvas.length-2));
    let yCanvas = document.getElementsByTagName('canvas')[0].style.height;
    let y = parseInt(yCanvas.substring(0, yCanvas.length-2));
    //todo check boundaries

    let yCoord = y + (event.clientY - y ) ;
    let xCoord = x + (event.clientX - x ) ;
    console.log('Size:\t X: '+ xCanvas + '\tY:' + yCanvas)
    console.log('Client:\t X:' +event.clientX +'\tY:'+ event.clientY)

    let pdfBytes = await this.pdfDoc.save();
    this.pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    console.log(width, ' ', height)
    const helveticaFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);



    xCoord =((event.clientX * width)/x);
    yCoord = height - ((event.clientY * height)/y);

    console.log('X: '+xCoord +'\tY: '+yCoord)


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

  async printMousePosition(event){
    console.log("X: ", event.clientX, " Y: ", event.clientY);
    let pdfBytes = await this.pdfDoc.save();
    this.pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = this.pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    const helveticaFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

    firstPage.drawText('This text was added with JavaScript!', {
      x: event.clientX,
      y: height - event.clientY,
      size: 50,
      font: helveticaFont,
      color: rgb(0.5, 0.2, 0.7),
      rotate: degrees(0),
    });
    pdfBytes = await this.pdfDoc.save();
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
