import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChattingDetailPage } from './chatting-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ChattingDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChattingDetailPageRoutingModule {}
