import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentAddPageRoutingModule } from './document-add-routing.module';

import { DocumentAddPage } from './document-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentAddPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [DocumentAddPage]
})
export class DocumentAddPageModule {}
