import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyWritePage } from './my-write.page';

const routes: Routes = [
  {
    path: '',
    component: MyWritePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyWritePageRoutingModule {}
