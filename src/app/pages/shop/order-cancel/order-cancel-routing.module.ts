import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderCancelPage } from './order-cancel.page';

const routes: Routes = [
  {
    path: '',
    component: OrderCancelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderCancelPageRoutingModule {}
