import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentArchivePage } from './document-archive.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentArchivePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentArchivePageRoutingModule {}
