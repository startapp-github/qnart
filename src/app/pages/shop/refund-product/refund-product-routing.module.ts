import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefundProductPage } from './refund-product.page';

const routes: Routes = [
  {
    path: '',
    component: RefundProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefundProductPageRoutingModule {}
