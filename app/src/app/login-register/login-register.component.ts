import { Component, OnInit, Input } from '@angular/core';
import {  AbstractControlOptions, FormBuilder,} from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { User } from './../Interfaces/user';
import { UserService } from '../Services/user.service';
import { ActivatedRoute } from '@angular/router';
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
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      loginEmail: ['', [Validators.required, Validators.email]],
      loginPassword: ['', [Validators.required, Validators.minLength(8)]],
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
    const { loginEmail, loginPassword } = this.loginForm.value;
    console.log(loginEmail + ' ' + loginPassword);
    let a = await this.storageService.login(loginEmail, loginPassword);
    console.log(a);
    if (a == true) {}
    this.storageService.getUserFromServer("60b89ade8d0127f52f8fa6cd").subscribe( data => {
      console.log(data);
      });
  }

  register(): void {
    let user = this.registerForm.value;
    console.log(user);
    delete user.confirmPassword;
    this.storageService.addUser(user);
  }

  changeOver(): void {
    if (this.registerButton) {
      this.registerButton = false;
    } else {
      this.registerButton = true;
    }
  }
}
