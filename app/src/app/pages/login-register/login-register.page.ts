/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

//biometric stuff
import { AvailableResult, BiometryType } from 'capacitor-native-biometric';
import { Credentials, NativeBiometric } from 'capacitor-native-biometric';
//popover

import { ActivatedRoute, Router } from '@angular/router';
import { match } from '../../Services/Validators/match.validator';

//popover
import { ModalController, PopoverController } from '@ionic/angular';
// import { RegisterLoginPopoverComponent } from './../../Popovers/register-login-popover/register-login-popover.component';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

//import for the users API and interface

import {
  UserAPIService,
  User,
  LoginData,
} from './../../Services/User/user-api.service';

import { ActionSheetController, Platform } from '@ionic/angular';
import * as Cookies from 'js-cookie';
//import for the loading controller
import { LoadingController } from '@ionic/angular';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';
import { ResetPasswordComponent } from 'src/app/components/reset-password/reset-password.component';
import { UserNotificationsComponent } from 'src/app/components/user-notifications/user-notifications.component';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  file: File;
  registerButton: boolean; //for the toggle to change modes

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userAPIService: UserAPIService,
    private plat: Platform,
    private actionSheetController: ActionSheetController,
    private loadCtrl: LoadingController,
    private modal: ModalController,
    private pop: PopoverController
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      loginEmail: ['brenton.stroberg@yahoo.co.za', [Validators.required, Validators.email]],
      loginPassword: ['Password#1', [Validators.required, Validators.minLength(8)]],
    });
    const formOptions: AbstractControlOptions = {
      validators: match('password', 'confirmPassword'),
    };

    this.registerForm = this.formBuilder.group(
      {
        Fname: ['', [Validators.required]],
        Lname: ['', [Validators.required]],
        initials: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone_number: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(9)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(9)]],
      },
      formOptions
    );
  }

  async login(): Promise<void> {
    const loginData: LoginData = {
      email: this.loginForm.value.loginEmail,
      password: this.loginForm.value.loginPassword,
    };
    console.log(loginData);
    this.userAPIService.login(loginData, (response) => {
      if (response.status === 'success') {
        //localStorage.setItem('token', response.data.token);
        Cookies.set('token', response.data.token, {expires: 1});
        this.userAPIService.displayPopOver('Success', 'login was successful');
        this.router.navigate(['home']);
      } else {
        console.log(response);
        this.userAPIService.displayPopOver(
          'Failure in logging in',
          'Email or password is incorrect'
        );
      }
    });
  }

  fileUnspecified(): void {
    this.userAPIService.displayPopOver(
      'Missing signature',
      'Please add a signature'
    );
  }

  async register(): Promise<void> {

    const a = await this.modal.create({
      component: UserNotificationsComponent,
      componentProps:{
        'title' : 'termsOfService',
      }
    });

    await (await a).present();
    const data = (await a).onDidDismiss();
    if(await (await data).data['confirm']){
      //still to do
    }
    console.log(a);
    this.loadingRegister();
    const userdata = this.registerForm.value;
    console.log('Printing file:');
    console.log(this.file);

    if (this.file === undefined) {
      //We don't allow users to register if they dont specify a signature.
      this.fileUnspecified();
      return;
    }

    console.log(userdata);
    const user: User = {
      Fname: userdata.Fname,
      Lname: userdata.Lname,
      initials: userdata.initials,
      email: userdata.email,
      password: userdata.password,
    };

    await this.loadingRegister();
    this.userAPIService.register(user, this.file, (response) => {
      if (response.status === 'success') {
        this.userAPIService.displayPopOver(
          'Successfully created new user account',
          'check your email for account verification'
        );
        this.router.navigate(['login']);
      } else {
        this.userAPIService.displayPopOver(
          'Failed to make a new account:',
          response.message
        );
      }
    });
    await this.loadCtrl.dismiss();
  }

  changeOver(): boolean {
    if (this.registerButton) {
      this.registerButton = false;
      return false;
    } else {
      this.registerButton = true;
      return true;
    }
  }

  async selectImageSource() {
    const buttons = [
      {
        text: 'Draw your signature',
        icon: 'create',
        handler: () => {
          this.addSignatureDraw();
        },
      },
    ];

    if (!this.plat.is('hybrid')) {
      buttons.push({
        text: 'Choose a File',
        icon: 'attach',
        handler: () => {
          this.fileInput.nativeElement.click();
        },
      });
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons,
    });

    await actionSheet.present();
  }

  uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.file = target.files[0];

    console.log('file', this.file);
  }

  async addSignatureDraw() {
    const mod = this.modal.create({
      component: AddSignatureComponent,
    });

    await (await mod).present();

    (await mod).onDidDismiss().then(async (data) => {
      (this.registerButton = data.data.registerButton),
        (this.file = data.data.signature);
      console.log(typeof this.file);
      //console.log(this.file);
    });
  }

  async displayResetPassword() {
    const mod = this.modal.create({
      component: ResetPasswordComponent,
    });

    (await mod).present();

    (await mod).onDidDismiss();
  }

  //  Loading Control for Register buttons
  async loadingRegister() {
    const load = await this.loadCtrl.create({
      message: 'Hang in there... we are almost done',
      duration: 5000,
      showBackdrop: false,
      spinner: 'bubbles',
    });

    await load.present();
  }

  debug() {
    NativeBiometric.isAvailable().then(
      (result: AvailableResult) => {
        const isAvailable = result.isAvailable;
        const isFaceId = result.biometryType === BiometryType.FACE_ID;

        if (isAvailable) {
          // Get user's credentials
          NativeBiometric.getCredentials({
            server: 'www.example.com',
          }).then((credentials: Credentials) => {
            // Authenticate using biometrics before logging the user in
            NativeBiometric.verifyIdentity({
              reason: 'For easy log in',
              title: 'Log in',
              subtitle: 'Maybe add subtitle here?',
              description: 'Maybe a description too?',
            }).then(
              () => {
                // Authentication successful
                console.log('log in');
                // this.login(credentials.username, credentials.password);
              },

              (error) => {
                // Failed to authenticate
              }
            );
          });
        }
      },
      (error) => {
        console.log('here');
        alert('here');
      }
    );
  }
}
