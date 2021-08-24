import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { InputFormComponent } from './input-form.component';

@NgModule({
  declarations: [InputFormComponent],
  imports: [CommonModule, IonicModule],
  exports: [InputFormComponent],
})
export class InputModule {}
