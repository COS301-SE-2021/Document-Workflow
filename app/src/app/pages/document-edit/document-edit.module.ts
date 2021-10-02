import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentEditPageRoutingModule } from './document-edit-routing.module';

import { DocumentEditPage } from './document-edit.page';
import { AutoFillComponent } from 'src/app/components/auto-fill/auto-fill.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentEditPageRoutingModule,
    AutoFillComponent
  ],
  declarations: [DocumentEditPage]
})
export class DocumentEditPageModule {}
