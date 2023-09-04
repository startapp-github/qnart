import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpiredServicePage } from './expired-service.page';

const routes: Routes = [
  {
    path: '',
    component: ExpiredServicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpiredServicePageRoutingModule {}
