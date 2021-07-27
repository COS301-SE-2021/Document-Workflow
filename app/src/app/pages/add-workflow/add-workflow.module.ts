import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddWorkflowPageRoutingModule } from './add-workflow-routing.module';

import { AddWorkflowPage } from './add-workflow.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddWorkflowPageRoutingModule
  ],
  declarations: [AddWorkflowPage]
})
export class AddWorkflowPageModule {}
