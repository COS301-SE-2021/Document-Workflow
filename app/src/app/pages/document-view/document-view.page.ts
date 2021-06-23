/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { ModalController, NavParams, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';
import { ActivatedRoute } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import { async } from '@angular/core/testing';


@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit {
  docPDF = null;
  srcFile: any;
  rotated: number;
  setZoom: any;
  zoomLevel: number;


  @Input('id') id: string;
  @Input('documentname') docName: string;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService
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

  download(url: string, title: string) {

  }
  async writeMyFile(fileData) {
    console.log(fileData);
    await Filesystem.writeFile({
      path: '/temp.pdf',
      data :  fileData,
      directory: Directory.Documents,

    });
    console.log('herre');
  }

  getDocument(id: string){
    console.log("ABOUT TO FETCH A DOCUMENt");
    console.log(id);
    this.docApi.getDocument(id, (response)=>{
      if (response){
        console.log(response);
        console.log(response.data.filedata);
        const buff = response.data.filedata.Body.data; //wut
        console.log(buff);
        const a  = new Uint8Array( buff);
        this.srcFile = a;
      }else{

      }
    });
  }

  async sign(){
    const sign = this.modalCtrl.create({
      component: AddSignatureComponent
    });
    // const { confirm } = (await sign).onWillDismiss();
    // console.log(data);

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