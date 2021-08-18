import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowEditPage } from './workflow-edit.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowEditPageRoutingModule {}
