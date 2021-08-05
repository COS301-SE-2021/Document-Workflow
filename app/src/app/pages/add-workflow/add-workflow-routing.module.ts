import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddWorkflowPage } from './add-workflow.page';

const routes: Routes = [
  {
    path: '',
    component: AddWorkflowPage,
    children: [
      // {
      //   path: 'ActionArea',
      //   loadChildren: () =>
      //     import(
      //       './../../components/document-action-area/document-action-area.component'
      //     ).then((m) => m.DocumentActionAreaComponent),
      //   pathMatch: 'full',
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkflowPageRoutingModule {}
