import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkflowsPageRoutingModule } from './workflows-routing.module';
import { WorkflowsPage } from './workflows.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowsPageRoutingModule
  ],
  declarations: [WorkflowsPage]
})
export class WorkflowsPageModule {}
