import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent implements OnInit {
  formAddComment: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
   this.formAddComment = this.fb.group({
    comment: ['',[Validators.required]]
   });
  }

  submit(){

  }

}
