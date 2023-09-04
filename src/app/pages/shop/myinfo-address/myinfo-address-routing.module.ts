import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyinfoAddressPage } from './myinfo-address.page';

const routes: Routes = [
  {
    path: '',
    component: MyinfoAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyinfoAddressPageRoutingModule {}
