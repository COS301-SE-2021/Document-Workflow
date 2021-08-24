import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginRegisterPageRoutingModule } from './login-register-routing.module';

import { LoginRegisterPage } from './login-register.page';
import {InputModule} from '../../components/input-form/input-form.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginRegisterPageRoutingModule,
    ReactiveFormsModule,
    InputModule
  ],
  declarations: [LoginRegisterPage]
})
export class LoginRegisterPageModule {}
