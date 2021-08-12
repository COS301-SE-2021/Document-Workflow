import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentAddPageRoutingModule } from './document-add-routing.module';

import { DocumentAddPage } from './document-add.page';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentAddPageRoutingModule,
    ReactiveFormsModule,
    PdfViewerModule,
  ],
  declarations: [DocumentAddPage]
})
export class DocumentAddPageModule {}
