import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentArchivePageRoutingModule } from './document-archive-routing.module';

import { DocumentArchivePage } from './document-archive.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentArchivePageRoutingModule
  ],
  declarations: [DocumentArchivePage]
})
export class DocumentArchivePageModule {}
