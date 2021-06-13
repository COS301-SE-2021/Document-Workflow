import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {

  resetForm: FormGroup;
  constructor(
    private toastCtrlr: ToastController) {}

  ngOnInit() {}


  reset(){

  }

  //  Toast Controller for reset-password...
  async emailSent()
  {
    const toastEmail = await this.toastCtrlr.create({
      message: 'Password email verification sent',
      color:'dark',
      duration: 4000,
      position:'top',
    });

    await toastEmail.present();

    setTimeout(() => {
      toastEmail.dismiss();
    },4000);
  }
}
