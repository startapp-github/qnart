import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommentCorrectPage } from './comment-correct.page';

const routes: Routes = [
  {
    path: '',
    component: CommentCorrectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommentCorrectPageRoutingModule {}
