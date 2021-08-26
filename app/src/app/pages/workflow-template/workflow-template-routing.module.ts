import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowTemplatePage } from './workflow-template.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowTemplatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowTemplatePageRoutingModule {}
