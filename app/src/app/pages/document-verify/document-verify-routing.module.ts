import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentVerifyPage } from './document-verify.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentVerifyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentVerifyPageRoutingModule {}
