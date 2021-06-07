import { Component, NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginRegisterComponent,
  },
  {
    path: 'view',
    component: ViewWorkflowComponent,

  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'add-document-modal',
    loadChildren: () => import('./Modals/add-document-modal/add-document-modal.module').then( m => m.AddDocumentModalPageModule)
  },
  {
    path: 'view-document-modal',
    loadChildren: () => import('./Modals/view-document-modal/view-document-modal.module').then( m => m.ViewDocumentModalPageModule)
  },
  {
    path: 'edit-document-modal',
    loadChildren: () => import('./Modals/edit-document-modal/edit-document-modal.module').then( m => m.EditDocumentModalPageModule)
  },




];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
