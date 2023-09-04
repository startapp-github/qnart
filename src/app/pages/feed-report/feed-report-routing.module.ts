import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeedReportPage } from './feed-report.page';

const routes: Routes = [
  {
    path: '',
    component: FeedReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedReportPageRoutingModule {}
