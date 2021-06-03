import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewDocumentModalPageRoutingModule } from './view-document-modal-routing.module';

import { ViewDocumentModalPage } from './view-document-modal.page';

import { File } from "@ionic-native/file/ngx";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { Injectable } from "@angular/core";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewDocumentModalPageRoutingModule
  ],
  declarations: [ViewDocumentModalPage]
})
export class ViewDocumentModalPageModule {}


@Injectable
({
  providedIn: "root"
})

export class DocumentService {
  fileTransfer: FileTransferObject;
  constructor(
    private fileOpener: FileOpener,
    private transfer: FileTransfer,
    private file: File
  ) {}

  download(url: string, title: string)
  {
    this.fileTransfer = this.transfer.create();
    this.fileTransfer.download(url, this.file.dataDirectory + title + ".pdf")
      .then(entry =>
      {
        console.log("downloaded successfully: " + entry.toURL());
        this.fileOpener
          .open(entry.toURL(), "application/pdf")
          .then(() => console.log("File is opened"))
          .catch(e => console.log("Error opening file", e));
      });
  }}