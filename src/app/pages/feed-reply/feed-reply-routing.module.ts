import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeedReplyPage } from './feed-reply.page';

const routes: Routes = [
  {
    path: '',
    component: FeedReplyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedReplyPageRoutingModule {}
