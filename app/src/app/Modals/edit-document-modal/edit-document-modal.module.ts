import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';



import { EditDocumentModalPageRoutingModule } from './edit-document-modal-routing.module';

import { EditDocumentModalPage } from './edit-document-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EditDocumentModalPageRoutingModule
  ],
  declarations: [EditDocumentModalPage]
})
export class EditDocumentModalPageModule {}
