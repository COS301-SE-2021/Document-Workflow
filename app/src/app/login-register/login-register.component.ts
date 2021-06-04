import { Component, OnInit, Input } from '@angular/core';
import {  AbstractControlOptions, FormBuilder,} from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../Services/user.service';

import { ActivatedRoute, Router } from '@angular/router';
import { match } from './match.validator';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;

  registerButton: boolean; //for the toggle to change modes

  constructor(
    private formBuilder: FormBuilder,
    private storageService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
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
    let a = await this.storageService.login(loginEmail, loginPassword);
    console.log(a);
    if (a == true) {
      this.router.navigate(["view"]);
    }
  }

  register(): void {
    let user = this.registerForm.value;
    console.log(user);
    delete user.confirmPassword;
    this.storageService.addUser(user);
    this.router.navigate(["view"]);
  }

  changeOver(): void {
    if (this.registerButton) {
      this.registerButton = false;
    } else {
      this.registerButton = true;
    }
  }

  loadSignature(event)
  {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () =>
    {
      // getting image blob
      let blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);

    //  create URL element Object
      let URL_blob: string = URL.createObjectURL(blob);
    };

  // error checking
    reader.onerror = (error) =>{
    };
  }


}
