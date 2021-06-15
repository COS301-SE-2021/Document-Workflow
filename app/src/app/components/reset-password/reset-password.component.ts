import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  constructor( private toastCtrlr: ToastController) { }

  ngOnInit() {}

  reset(){

  }

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

