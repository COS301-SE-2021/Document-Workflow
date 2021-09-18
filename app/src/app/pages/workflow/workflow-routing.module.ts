import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginRegisterPage} from '../login-register/login-register.page';
import { WorkflowPage } from './workflow.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowPage
  },
  {
    path: 'login',
    component: LoginRegisterPage
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowPageRoutingModule {}
