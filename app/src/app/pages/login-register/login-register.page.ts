/* eslint-disable @typescript-eslint/naming-convention */

import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { match } from './../../Services/match.validator';

//popover
import {ModalController, PopoverController} from '@ionic/angular';
// import { RegisterLoginPopoverComponent } from './../../Popovers/register-login-popover/register-login-popover.component';


import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

//import for the users API and interface


import { UserAPIService, User, LoginData } from './../../Services/User/user-api.service';

import { ActionSheetController, Platform } from '@ionic/angular';

//import for the loading controller
import {LoadingController} from '@ionic/angular';
import { Plugins } from 'protractor/built/plugins';
import {DocumentAPIService} from './../../Services/Document/document-api.service';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.page.html',
  styleUrls: ['./login-register.page.scss'],
})
export class LoginRegisterPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  file: File;
  public registerButton: boolean; //for the toggle to change modes

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @ViewChild('fileInput', { static: false })fileInput: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userAPIService: UserAPIService,
    private plat: Platform,
    private actionSheetController: ActionSheetController,
    private loadCtrl: LoadingController,
    private modal: ModalController,
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      loginEmail: ['u17015741@tuks.co.za', [Validators.required, Validators.email]],
      loginPassword: ['submarine', [Validators.required, Validators.minLength(8)]],
    });
    const formOptions: AbstractControlOptions = {
      validators: match('password', 'confirmPassword'),
    };

    this.registerForm = this.formBuilder.group(
      {
        Fname: ['Timothy', [Validators.required]],
        Lname: ['Hill', [Validators.required]],
        initials: ['TH', [Validators.required]],
        email: ['hill@tim.com', [Validators.required, Validators.email]],
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
    console.log(this.loginForm.value);
    const loginData: LoginData=
    {
      email: this.loginForm.value.loginEmail,
      password : this.loginForm.value.loginPassword
    };
    console.log(loginData);
    this.userAPIService.login(loginData, (response)=>{
        if(response.status === 'success'){
          alert('Login Successful');
          this.router.navigate(['home']);
        }
        else{alert(response.message);}
    });
  }

  fileUnspecified(): void{
    //For Brent for if the signasture doesnt exists

  }

  async register(): Promise<void> {
    const userdata = this.registerForm.value;
    console.log('Printing file:');
    console.log(this.file);

    if(this.file === undefined) //We don't allow users to register if they dont specify a signature.
    {
        this.fileUnspecified();
        return;
    }

    console.log(userdata);
    const user: User = {
      Fname: userdata.Fname,
      Lname: userdata.Lname,
      initials: userdata.initials,
      email: userdata.email,
      password: userdata.password
    };


    this.userAPIService.register(user, this.file, (response)=>{
        if(response.status === 'success')
        {
          alert('Successfully created new user account, check your email for account verification');
          this.router.navigate(['home']);
        }
        else {
          alert('Failed to make a new account: ' + response.message);
        }
        this.loadCtrl.dismiss();
    });
  }

  changeOver($event)
  {
    this.registerButton = !this.registerButton;
  }

  async selectImageSource() {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.addSignature(CameraSource.Camera);
        },
      },
      {
        text: 'Choose from photo library',
        icon: 'image',
        handler: () => {
          this.addSignature(CameraSource.Photos);
        },
      },
      {
        text: 'Draw your signature',
        icon: 'create',
        handler:()=>{
          this.addSignatureDraw();
        }
      }
    ];

    if (!this.plat.is('hybrid')) {
      console.log('here');
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

  async addSignatureDraw(){
    const mod = this.modal.create({
      component: AddSignatureComponent
    });

    (await mod).present();

    (await mod).onDidDismiss().then(async (data) => {
      // data goes in here, workflow page.ts as an example
    });
  }

  async addSignature(source: CameraSource) {
    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source
    });

    console.log('image: ', image);
  }


//  Loading Control for Register buttons
  async loadingRegister()
  {
    const load = await this.loadCtrl.create({
      message: 'Hang in there... we are almost done',
      duration: 5000,
      showBackdrop: false,
      spinner: 'bubbles'
    });

    await load.present();
  }
}