import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentEditPage } from './document-edit.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentEditPageRoutingModule {}
