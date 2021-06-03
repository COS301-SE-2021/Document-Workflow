import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddDocumentModalPage } from './add-document-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddDocumentModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddDocumentModalPageRoutingModule {}
