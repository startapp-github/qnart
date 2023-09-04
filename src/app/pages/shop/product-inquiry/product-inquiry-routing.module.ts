import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductInquiryPage } from './product-inquiry.page';

const routes: Routes = [
  {
    path: '',
    component: ProductInquiryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductInquiryPageRoutingModule {}
