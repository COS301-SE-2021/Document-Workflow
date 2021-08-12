import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRegisterPage } from './login-register.page';
import { AddSignatureComponent} from '../../components/add-signature/add-signature.component';

const routes: Routes = [
  {
    path: '',
    component: LoginRegisterPage
  },
  {
    path: 'addSignature',
    component: AddSignatureComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRegisterPageRoutingModule {}
