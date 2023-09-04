import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderListDetailPage } from './order-list-detail.page';

const routes: Routes = [
  {
    path: '',
    component: OrderListDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderListDetailPageRoutingModule {}
