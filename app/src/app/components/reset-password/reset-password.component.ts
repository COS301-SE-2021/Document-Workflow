import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { match } from 'src/app/Services/Validators/match.validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  phase2: boolean;
  resetForm: FormGroup;
  resetPasswordForm: FormGroup;
  constructor(
    private toastCtrlr: ToastController,
    private fb: FormBuilder,
    private userService: UserAPIService
  ) {}

  ngOnInit() {
    this.phase2 = true;
    this.resetForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    });

    const formOptions: AbstractControlOptions = {
      validators: match('password', 'confirmPassword'),
    };

    this.resetPasswordForm = this.fb.group({
      confirmationString: ['',[Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    }, formOptions);
  }

  reset() {

  }

  resetPassword(){

  }

  async emailSent() {
    const toastEmail = await this.toastCtrlr.create({
      message: 'Password email verification sent',
      color: 'dark',
      duration: 3000,
      position: 'top',
    });

    await toastEmail.present();

    setTimeout(() => {
      toastEmail.dismiss();
    }, 3000);
    this.phase2 = false;
  }
}
