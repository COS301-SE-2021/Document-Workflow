import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitViewPage } from './split-view.page';

const routes: Routes = [
  {
    path: '',
    component: SplitViewPage,
    children: [
      {
        path: 'archive',
        loadChildren: () =>
          import('./../document-archive/document-archive.module').then(
            (m) => m.DocumentArchivePageModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'documentView',
        loadChildren: () =>
          import('./../document-view/document-view.module').then(
            (m) => m.DocumentViewPageModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'userProfile',
        loadChildren: () =>
          import('./../user-profile/user-profile.module').then(
            (m) => m.UserProfilePageModule
          ),
        pathMatch: 'full',
      },
      {
        path: '',
        loadChildren: () =>
          import('./../workflow/workflow.module').then(
            (m) => m.WorkflowPageModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'workflowEdit',
        loadChildren: () =>
          import('./../workflow-edit/workflow-edit.module').then(
            (m) => m.WorkflowEditPageModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./../contacts/contacts.module').then(
            (m) => m.ContactsPageModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'documentEdit',
        loadChildren: () =>
          import('./../document-edit/document-edit.module').then(
            (m) => m.DocumentEditPageModule
          ),
        pathMatch: 'full',
      },
      {
        path: 'addWorkflow',
        loadChildren: () =>
          import('./../document-add/document-add.module').then(
            (m) => m.DocumentAddPageModule
          ),
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplitViewPageRoutingModule {}
