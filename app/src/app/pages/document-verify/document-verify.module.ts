import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentVerifyPageRoutingModule } from './document-verify-routing.module';

import { DocumentVerifyPage } from './document-verify.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentVerifyPageRoutingModule
  ],
  declarations: [DocumentVerifyPage]
})
export class DocumentVerifyPageModule {}
