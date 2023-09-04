import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewWritePage } from './review-write.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewWritePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewWritePageRoutingModule {}
