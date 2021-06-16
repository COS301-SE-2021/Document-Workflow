/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { ModalController, NavParams, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit {
  docPDF = null;
  srcFile: string;
  rotated: number;
  setZoom: any;
  zoomLevel: number;


  @Input('id') id: string;
  @Input('documentname') docName: string;
  constructor(
    private plat: Platform,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.srcFile = './../../../assets/Timesheet-Template.pdf';
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel=1;
    this.route.params.subscribe(stuff =>{
      this.id = stuff['id'];
      this.docName = stuff['documentname'];
    });
  }

  download(url: string, title: string) {

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
    console.log("here");
  }
}
