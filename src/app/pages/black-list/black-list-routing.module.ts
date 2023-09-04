import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlackListPage } from './black-list.page';

const routes: Routes = [
  {
    path: '',
    component: BlackListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlackListPageRoutingModule {}
