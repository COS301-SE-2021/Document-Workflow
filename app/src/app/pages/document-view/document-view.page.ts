import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


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

  constructor(
    private plat: Platform,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.srcFile = './../../../assets/Timesheet-Template.pdf';
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel=1;
  }

  download(url: string, title: string) {

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


}
