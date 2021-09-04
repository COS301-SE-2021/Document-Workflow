import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkflowHistoryPageRoutingModule } from './workflow-history-routing.module';

import { WorkflowHistoryPage } from './workflow-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowHistoryPageRoutingModule
  ],
  declarations: [WorkflowHistoryPage]
})
export class WorkflowHistoryPageModule {}
