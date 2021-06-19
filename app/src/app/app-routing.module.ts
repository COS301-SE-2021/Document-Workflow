import { Component, NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AddSignatureComponent } from './components/add-signature/add-signature.component';



const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login-register/login-register.module').
    then( m => m.LoginRegisterPageModule),
    pathMatch: 'full'
  },
  {
    path: 'resetPassword',
    component: ResetPasswordComponent
  },
  {
    path: 'addSignature',
    component: AddSignatureComponent
  },
  {
    path: 'archive',
    loadChildren: () => import('./pages/document-archive/document-archive.module').
    then( m => m.DocumentArchivePageModule),
    pathMatch: 'full'
  },
  {
    path: 'documentView',
    loadChildren: () => import('./pages/document-view/document-view.module').
    then( m => m.DocumentViewPageModule),
    pathMatch: 'full'
  },
  {
    path: 'userProfile',
    loadChildren: () => import('./pages/user-profile/user-profile.module').
    then( m => m.UserProfilePageModule),
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/workflow/workflow.module').
    then( m => m.WorkflowPageModule),
    pathMatch: 'full'
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro-routing.module').
    then( m => m.IntroPageRoutingModule),
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponents = [ResetPasswordComponent,AddSignatureComponent];
