import { Component, NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AddSignatureComponent } from './components/add-signature/add-signature.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login-register/login-register.module').then(
        (m) => m.LoginRegisterPageModule
      ),
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/split-view/split-view.module').then( m => m.SplitViewPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },  {
    path: 'document-edit',
    loadChildren: () => import('./pages/document-edit/document-edit.module').then( m => m.DocumentEditPageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponents = [
  ResetPasswordComponent,
  AddSignatureComponent,
];
