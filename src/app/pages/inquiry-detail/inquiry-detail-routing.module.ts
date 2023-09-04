import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InquiryDetailPage } from './inquiry-detail.page';

const routes: Routes = [
  {
    path: '',
    component: InquiryDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InquiryDetailPageRoutingModule {}
