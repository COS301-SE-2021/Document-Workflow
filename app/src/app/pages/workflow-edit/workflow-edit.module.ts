import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkflowEditPageRoutingModule } from './workflow-edit-routing.module';

import { WorkflowEditPage } from './workflow-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowEditPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [WorkflowEditPage]
})
export class WorkflowEditPageModule {}
