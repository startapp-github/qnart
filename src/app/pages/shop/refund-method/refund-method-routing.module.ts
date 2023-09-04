import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundMethodPage } from './refund-method.page';

const routes: Routes = [
  {
    path: '',
    component: RefundMethodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundMethodPageRoutingModule {}
