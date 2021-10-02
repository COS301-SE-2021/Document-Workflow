import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams, Platform } from '@ionic/angular';

@Component({
  selector: 'app-auto-fill',
  templateUrl: './auto-fill.component.html',
  styleUrls: ['./auto-fill.component.scss'],
})
export class AutoFillComponent implements OnInit {
  formOptions: FormGroup;

  constructor(private fb: FormBuilder, private modal: ModalController) {}

  ngOnInit() {

    this.formOptions = this.fb.group({
      flag: ['', Validators.required],
      inputText: ['', Validators.required],
      fontSize: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  dismiss(){
    this.modal.dismiss({
      flag : this.formOptions.get("flag").value,
      inputText : this.formOptions.get("inputText").value,
      fontSize : this.formOptions.get("fontSize").value
    })
  }
}
