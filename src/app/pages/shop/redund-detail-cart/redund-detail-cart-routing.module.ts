import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedundDetailCartPage } from './redund-detail-cart.page';

const routes: Routes = [
  {
    path: '',
    component: RedundDetailCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RedundDetailCartPageRoutingModule {}
