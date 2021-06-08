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
  }

  async login(): Promise<void> {
    const { loginEmail, loginPassword } = this.loginForm.value;
    console.log(loginEmail + ' ' + loginPassword);
    const a = await this.storageService.login(loginEmail, loginPassword);
    console.log(a);
    if (a === true) {
      this.router.navigate(['view']);
    }
  }
}
