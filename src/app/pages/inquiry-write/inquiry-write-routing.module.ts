import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryWritePage } from './inquiry-write.page';

const routes: Routes = [
  {
    path: '',
    component: InquiryWritePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InquiryWritePageRoutingModule {}
