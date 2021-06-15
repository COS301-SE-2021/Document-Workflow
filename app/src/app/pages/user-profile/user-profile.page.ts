/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {AbstractControlOptions, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UserAPIService } from '../../Services/User/user-api.service';
import { match } from './../../Services/match.validator';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})

export class UserProfilePage implements OnInit {
  user: User;
  userForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserAPIService
    ) { }

  ngOnInit() {

    const formOptions: AbstractControlOptions = { validators: match('password', 'confirmPassword') };
    this.userForm = this.fb.group({
      Fname:[this.user.Fname,[Validators.required]],
      Lname: [this.user.Lname,[Validators.required]],
      initials: [this.user.initials,[Validators.required]],
      // phone_number: ['',[Validators.required]],
      email: [this.user.email,[Validators.required]],
      password: ['',[Validators.nullValidator]],
      confirmPassword: ['',[Validators.nullValidator]],
    });
  }

  submit(){
    this.user = this.userForm.value;
  }

  update(){

  }
}
