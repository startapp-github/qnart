import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductDetailPopupPage } from './product-detail-popup.page';

const routes: Routes = [
  {
    path: '',
    component: ProductDetailPopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductDetailPopupPageRoutingModule {}
