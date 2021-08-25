import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { DocumentViewPageRoutingModule } from './document-view-routing.module';

import { DocumentViewPage } from './document-view.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentViewPageRoutingModule,
    PdfViewerModule,
    ReactiveFormsModule,
  ],
  declarations: [DocumentViewPage]
})
export class DocumentViewPageModule {}
