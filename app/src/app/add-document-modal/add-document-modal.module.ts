import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDocumentModalPageRoutingModule } from './add-document-modal-routing.module';

import { AddDocumentModalPage } from './add-document-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddDocumentModalPageRoutingModule
  ],
  declarations: [AddDocumentModalPage]
})
export class AddDocumentModalPageModule {}
