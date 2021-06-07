import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { match } from './match.validator';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

//import for the users API and interface
import { UserAPIService, User } from '../Services/user-api.service';
import { ActionSheetController, Platform } from '@ionic/angular';
import { Plugins } from 'protractor/built/plugins';


@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;

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
    const { loginEmail, loginPassword } = this.loginForm.value;
    console.log(loginEmail + ' ' + loginPassword);
    let a = true;
    console.log(a);
    if (a == true) {
      this.router.navigate(['view']);
    }
  }

  /**
   * TODO: add verification functions on front end (ie check that confirm password matches password
   */
  register(): void {
    const userdata = this.registerForm.value;
    console.log(userdata);
    const user: User = {
      Fname: userdata.Fname,
      Lname: userdata.Lname,
      initials: userdata.initials,
      email: userdata.email,
      password: userdata.password
    };
    if(UserAPIService.register(user))
    {console.log('User registerd');}
    else {console.log('registration failed');}
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

  loadSignature(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      // getting image blob
      let blob: Blob = new Blob([new Uint8Array(reader.result as ArrayBuffer)]);

      //  create URL element Object
      let URL_blob: string = URL.createObjectURL(blob);
    };

    // error checking
    reader.onerror = (error) => {};
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
    const file: File = target.files[0];

    console.log("file", file);
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
