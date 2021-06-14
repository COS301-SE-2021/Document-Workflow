import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';

import { DocumentViewPage } from './document-view.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentViewPage
  },
  {
    path: 'AddSignature',
    component: AddSignatureComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentViewPageRoutingModule {}
