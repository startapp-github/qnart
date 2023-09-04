import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecommendPage } from './recommend.page';

const routes: Routes = [
  {
    path: '',
    component: RecommendPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecommendPageRoutingModule {}
