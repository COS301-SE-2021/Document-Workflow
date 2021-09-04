import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowHistoryPage } from './workflow-history.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowHistoryPageRoutingModule {}
