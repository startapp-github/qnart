import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundReasonPage } from './refund-reason.page';

const routes: Routes = [
  {
    path: '',
    component: RefundReasonPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundReasonPageRoutingModule {}
