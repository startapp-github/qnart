import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundReasonCompletePage } from './refund-reason-complete.page';

const routes: Routes = [
  {
    path: '',
    component: RefundReasonCompletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundReasonCompletePageRoutingModule {}
