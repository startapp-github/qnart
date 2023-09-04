import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryPage } from './inquiry.page';

const routes: Routes = [
  {
    path: '',
    component: InquiryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InquiryPageRoutingModule {}
