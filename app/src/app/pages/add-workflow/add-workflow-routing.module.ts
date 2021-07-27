import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddWorkflowPage } from './add-workflow.page';

const routes: Routes = [
  {
    path: '',
    component: AddWorkflowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkflowPageRoutingModule {}
