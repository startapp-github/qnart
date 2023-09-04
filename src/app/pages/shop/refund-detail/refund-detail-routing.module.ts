import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundDetailPage } from './refund-detail.page';

const routes: Routes = [
  {
    path: '',
    component: RefundDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundDetailPageRoutingModule {}
