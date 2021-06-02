import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SMS } from '@ionic-native/sms/ngx';
import { User } from './../user';
import { UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';
import { match } from './match.validator';
import { Tab1Page } from './../tab1/tab1.page';
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
    private sms: SMS,
    private storageService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router
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
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        initials: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
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
      console.log('here');
      // this.activatedRoute.snapshot.paramMap.get('tabs');
      // this.router.navigateByUrl('../tab1')
    }
  }

  register(): void {
    let user = this.registerForm.value;
    console.log(user);
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
