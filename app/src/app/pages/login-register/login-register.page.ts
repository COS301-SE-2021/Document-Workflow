/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/naming-convention */

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

//biometric stuff
import { AvailableResult, BiometryType } from 'capacitor-native-biometric';
import { Credentials, NativeBiometric } from 'capacitor-native-biometric';
//popover

import { Router } from '@angular/router';
import { match } from '../../Services/Validators/match.validator';

//popover
import { ModalController } from '@ionic/angular';
// import { RegisterLoginPopoverComponent } from './../../Popovers/register-login-popover/register-login-popover.component';

import {
  UserAPIService,
  User,
  LoginData,
} from './../../Services/User/user-api.service';

import { ActionSheetController, Platform } from '@ionic/angular';
import * as Cookies from 'js-cookie';

import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';


@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  resetForm: FormGroup;
  resetPasswordForm: FormGroup;

  file: File;

  registerButton: boolean; //for the toggle to change modes
  biometricAvaliable: boolean;
  resetPassword: boolean;
  loginAndRegister: boolean;
  phase1: boolean;
  sizeMe:boolean;
  loginRegisterScreen: boolean;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userAPIService: UserAPIService,
    private plat: Platform,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
  ) {}

  ngOnInit() {
    this.loginAndRegister = true;
    this.resetPassword = false;
    this.loginRegisterScreen = true;
    this.loginForm = this.formBuilder.group({
      // loginEmail: ['', [Validators.required, Validators.email]],
      // loginPassword: ['', [Validators.required, Validators.minLength(8)]],
      loginEmail: [
        'brenton.stroberg@yahoo.co.za',
        [Validators.required, Validators.email],
      ],
      loginPassword: [
        'Password#1',
        [Validators.required, Validators.minLength(8)],
      ],
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

    this.resetForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    });


    this.resetPasswordForm = this.formBuilder.group({
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

    if(this.plat.is("android")){
      NativeBiometric.isAvailable().then((result: AvailableResult) => {
        const isAvailable = result.isAvailable;
        this.biometricAvaliable = result.isAvailable;
      });
    }

    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }
  }

  async login(): Promise<void> {
    const loginData: LoginData = {
      email: this.loginForm.value.loginEmail,
      password: this.loginForm.value.loginPassword,
    };
    this.userAPIService.login(loginData, (response) => {
      if (response.status === 'success') {
        //localStorage.setItem('token', response.data.token);
        Cookies.set('token', response.data.token, { expires: 1 });
        if(this.plat.is("android")){
          this.setCredentials();
        }
        // this.userAPIService.displayPopOver('Success', 'login was successful');
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
    this.userAPIService.displayPopOverWithButtons(
      'termsOfService',
      '',
      (response) => {
        console.log(response);
        if (response.data.confirm === true) {
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

          this.userAPIService.register(
            user,
            userdata.confirmPassword,
            this.file,
            (response) => {
              if (response.status === 'success') {
                this.userAPIService.displayPopOver(
                  'Successfully created new user account',
                  'check your email for account verification'
                );

                this.router.navigate(['login']);
              }
            }
          );
        }
      }
    );
  }

  changeOver() {
    this.loginRegisterScreen = !this.loginRegisterScreen;
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
    this.loginAndRegister = false;
    this.resetPassword = true;
  }

  loginUsingBiometric() {
    NativeBiometric.getCredentials({
      server: 'www.documentWorkflow.com',
    }).then((credentials: Credentials) => {
      NativeBiometric.verifyIdentity({}).then(() => {
        const loginData: LoginData = {
          email: credentials.username,
          password: credentials.password
        };
        console.log(loginData);
        this.userAPIService.login(loginData, (response) => {
          if (response.status === 'success') {
            //localStorage.setItem('token', response.data.token);
            Cookies.set('token', response.data.token, { expires: 1 });
            // this.userAPIService.displayPopOver('Success', 'login was successful');
            this.router.navigate(['home']);
          } else {
            console.log(response);
            this.userAPIService.displayPopOver(
              'Failure in logging in',
              'Email or password is incorrect'
            );
          }
        });
      },
      (error)=>{
        this.userAPIService.displayPopOver('Failure in logging in','Fingerprint incorrect')
      });
    });
  }

  setCredentials(){
    if(this.biometricAvaliable){
      NativeBiometric.setCredentials({
        username: this.loginForm.value.loginEmail,
        password: this.loginForm.value.loginPassword,
        server: 'www.documentWorkflow.com'
      })
    }
  }

  back(){
    this.loginAndRegister=true;
    this.loginRegisterScreen = true;
    this.resetPassword =false;
    this.phase1 = true;
  }

  reset(){

  }

  resetPassword1(){

  }

  resetPassword2(){

  }
}
