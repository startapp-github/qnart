import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChattingPage } from './chatting.page';

const routes: Routes = [
  {
    path: '',
    component: ChattingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChattingPageRoutingModule {}
