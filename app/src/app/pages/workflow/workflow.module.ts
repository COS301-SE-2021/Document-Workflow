import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkflowPageRoutingModule } from './workflow-routing.module';

import { WorkflowPage } from './workflow.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [WorkflowPage]
})
export class WorkflowPageModule {}
