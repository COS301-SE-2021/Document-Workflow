import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkflowTemplatePageRoutingModule } from './workflow-template-routing.module';

import { WorkflowTemplatePage } from './workflow-template.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowTemplatePageRoutingModule
  ],
  declarations: [WorkflowTemplatePage]
})
export class WorkflowTemplatePageModule {}
