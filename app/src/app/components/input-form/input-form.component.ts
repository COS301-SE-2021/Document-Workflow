import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.scss'],
})
export class InputFormComponent implements OnInit {

  @Input() type: string;
  @Input() placeholder: string;
  constructor() { }

  ngOnInit() {}

}
