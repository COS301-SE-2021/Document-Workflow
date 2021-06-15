import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { match } from './match.validator';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

//import for the users API and interface
import { UserAPIService, User, LoginData } from '../Services/user-api.service';
import { ActionSheetController, Platform } from '@ionic/angular';
import { Plugins } from 'protractor/built/plugins';
import {DocumentAPIService} from "../Services/document-api.service";


@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  file: File;
  registerButton: boolean; //for the toggle to change modes

  @ViewChild('fileInput', { static: false })fileInput: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserAPIService,
    private plat: Platform,
    private actionSheetController: ActionSheetController
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
    const success = await UserAPIService.login(loginData);
    if(success === 'Success')
    {
      alert('Login Successful');
      this.router.navigate(['view']);
    }
    else {
      alert('Username or Password incorrect');
    }

  }

  fileUnspecified(): void{
    //For Brent

  }

  /**
   * TODO: add verification functions on front end (ie check that confirm password matches password
   */
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

    const success = await UserAPIService.register(user, this.file);
    if(success)
    {alert('User registered');}
    else {alert('registration failed');}
    delete userdata.confirmPassword;
    this.router.navigate(['login']);
  }

  changeOver(): void {
    if (this.registerButton) {
      this.registerButton = false;
    } else {
      this.registerButton = true;
    }
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

    console.log("file", this.file);
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
}
