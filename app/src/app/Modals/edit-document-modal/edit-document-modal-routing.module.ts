import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditDocumentModalPage } from './edit-document-modal.page';

const routes: Routes = [
  {
    path: '',
    component: EditDocumentModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditDocumentModalPageRoutingModule {}
