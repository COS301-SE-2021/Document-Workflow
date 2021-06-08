import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-document-modal',
  templateUrl: './view-document-modal.page.html',
  styleUrls: ['./view-document-modal.page.scss'],
})

export class ViewDocumentModalPage implements OnInit {
  docPDF = null;
  srcFile: string;
  rotated: number;
  setZoom: string;
  zoomLevel: number;

  constructor(
    private plat: Platform,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.srcFile = "./../../../assets/Timesheet-Template.pdf";
    this.rotated = 0;
    this.setZoom = "false";
  }

  download(url: string, title: string) {

  }

  rotation(){
    this.rotated += 90;
    if(this.rotated == 360){
      this.rotated =0;
    }
  }

  setZoomWidth(){
    this.setZoom ='page-width';
  }

  setZoomFit(){
    this.setZoom ='page-fit';
  }

  setZoomHeight(){
    this.setZoom ='page-height';
  }

  zoomIn(){
    this.zoomLevel += 0.25;
  }

  zoomOut(){
    this.zoomLevel -=0.25;
  }


}
