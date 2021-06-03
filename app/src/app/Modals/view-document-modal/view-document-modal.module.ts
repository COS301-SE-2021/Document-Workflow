import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewDocumentModalPageRoutingModule } from './view-document-modal-routing.module';

import { ViewDocumentModalPage } from './view-document-modal.page';



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

