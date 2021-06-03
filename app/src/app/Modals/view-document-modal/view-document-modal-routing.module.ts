import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewDocumentModalPage } from './view-document-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ViewDocumentModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewDocumentModalPageRoutingModule {}
