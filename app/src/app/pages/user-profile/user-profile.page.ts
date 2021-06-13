import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {AbstractControlOptions, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAPIService } from '../../Services/User/user-api.service';
import { match } from './../../Services/match.validator';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {

  userFrom: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserAPIService
    ) { }

  ngOnInit() {
    const formOptions: AbstractControlOptions = { validators: match('password', 'confirmPassword') };
    this.userFrom = this.fb.group({
      Fname:['',[Validators.required]],
      Lname: ['',[Validators.required]],
      initials: ['',[Validators.required]],
      // phone_number: ['',[Validators.required]],
      email: ['',[Validators.required]],
      password: ['',[Validators.nullValidator]],
      confirmPassword: ['',[Validators.nullValidator]],
    });
  }

  submit(){

  }
}
