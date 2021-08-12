import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentAddPage } from './document-add.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentAddPageRoutingModule {}
