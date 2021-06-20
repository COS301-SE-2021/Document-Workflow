/* eslint-disable @typescript-eslint/naming-convention */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbstractControlOptions, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UserAPIService } from '../../Services/User/user-api.service';
import { match } from './../../Services/match.validator';
import { ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})

export class UserProfilePage implements OnInit {
  user: User;
  userForm: FormGroup;
  srcFile: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserAPIService
    ) { }

  async ngOnInit() {
    await (this.getUser());
  }

  ngOnDestroy(): void {
  // URL.revokeObjectURL();
  }

  async getUser(){
    await this.userService.getUserDetails(async (response)=>{
      if(response){
        await (this.user = response.data);
        console.log(this.user);
        const formOptions: AbstractControlOptions = { validators: match('password', 'confirmPassword') };

        this.userForm = this.fb.group({
          Fname:[response.data.name,[Validators.required]],
          Lname: [response.data.surname,[Validators.required]],
          initials: [response.data.initials,[Validators.required]],
          // phone_number: ['',[Validators.required]],
          email: [response.data.email,[Validators.required]],
          password: ['',[Validators.nullValidator]],
          confirmPassword: ['',[Validators.nullValidator]],
        }, formOptions);

        const a  = new Uint8Array( response.data.signature.data);
        console.log(a);
        this.srcFile = a;
      }
    });
  }

  submit(){
    let use = this.userForm.value;
    if(use.password === ""){
      //if the user hasnt changed the password
    }
    console.log(this.user);
  }

  back(){
    this.router.navigate(['home']);
  }
}
