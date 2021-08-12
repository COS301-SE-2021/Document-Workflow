import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentEditPageRoutingModule } from './document-edit-routing.module';

import { DocumentEditPage } from './document-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentEditPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [DocumentEditPage]
})
export class DocumentEditPageModule {}
