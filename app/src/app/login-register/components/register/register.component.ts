import { Component, OnInit } from '@angular/core';
import {AbstractControlOptions, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../../Services/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {match} from "../../match.validator";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private registerForm: any;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
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
    );
  }

  register(): void {
    const user = this.registerForm.value;
    console.log(user);
    delete user.confirmPassword;
    this.storageService.addUser(user);
    this.router.navigate(['view']);
  }

  loadSignature(event)
  {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () =>
    {
      // getting image blob
      const blob: Blob = new Blob([new Uint8Array((reader.result as ArrayBuffer))]);

      //  create URL element Object
      const urlBlob: string = URL.createObjectURL(blob);
    };

    // error checking
    reader.onerror = (error) =>{
    };
  }




}
