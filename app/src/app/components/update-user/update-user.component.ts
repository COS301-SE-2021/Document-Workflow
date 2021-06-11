/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/Services/User/user-api.service';
import {match} from './../../Services/match.validator';
@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss'],
})
export class UpdateUserComponent implements OnInit {
  updateForm: FormGroup;
  @Input('user')user: User;
  constructor(
    private fb: FormBuilder
  ) { }



  ngOnInit() {
    const formOptions: AbstractControlOptions = {
      validators: match('password', 'confirmPassword'),
    };
    if(this.user === null){
      this.updateForm = this.fb.group({
        Fname: [this.user.Fname, [Validators.required]],
        Lname: [this.user.Lname, [Validators.required]],
        initials: [this.user.initials, [Validators.required]],
        email: [this.user.email, [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(9)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(9)]],
      },formOptions
     );
    }else{
    this.updateForm = this.fb.group({
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
    },formOptions
   );
  }
  }

  update(){

  }

}
