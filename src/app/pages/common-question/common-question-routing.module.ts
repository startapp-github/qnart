import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommonQuestionPage } from './common-question.page';

const routes: Routes = [
  {
    path: '',
    component: CommonQuestionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonQuestionPageRoutingModule {}
