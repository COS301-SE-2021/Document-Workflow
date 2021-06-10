import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentArchiveComponent } from '../document-archive/document-archive.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

import { WorkflowsPage } from './workflows.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowsPage,
    pathMatch: 'full',
  },
  {
    path: 'archive',
    component: DocumentArchiveComponent,
    pathMatch: 'full',
  },
  {
    path: 'userProfile',
    component: UserProfileComponent,
    pathMatch: 'full',
  },
  {
    path: 'add-document-modal',
    loadChildren: () =>
      import('./../Modals/add-document-modal/add-document-modal.module')
      .then((m) => m.AddDocumentModalPageModule),
    pathMatch: 'full',
  },
  {
    path: 'view-document-modal',
    loadChildren: () =>
      import('./../Modals/view-document-modal/view-document-modal.module')
      .then((m) => m.ViewDocumentModalPageModule ),
    pathMatch: 'full',
  },
  {
    path: 'edit-document-modal',
    loadChildren: () =>
      import('./../Modals/edit-document-modal/edit-document-modal.module')
      .then((m) => m.EditDocumentModalPageModule),
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowsPageRoutingModule {}
