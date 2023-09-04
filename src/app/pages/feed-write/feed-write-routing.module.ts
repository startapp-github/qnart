import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeedWritePage } from './feed-write.page';

const routes: Routes = [
  {
    path: '',
    component: FeedWritePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedWritePageRoutingModule {}
