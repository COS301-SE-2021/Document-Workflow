import { Component, NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


import { LoginRegisterComponent } from './login-register/login-register.component';
import { PasswordResetComponent } from "./login-register/components/password-reset/password-reset.component";
import { WorkflowsPageModule } from './workflows/workflows.module';


const routes: Routes = [
  {
    path: 'login',
    component: LoginRegisterComponent,
    pathMatch: 'full',
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
    pathMatch: 'full',
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'main',
    loadChildren: () => import('./workflows/workflows.module').then( m => m.WorkflowsPageModule),
    pathMatch: 'full',
  },{
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
