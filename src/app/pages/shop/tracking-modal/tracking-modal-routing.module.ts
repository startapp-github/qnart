import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackingModalPage } from './tracking-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TrackingModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackingModalPageRoutingModule {}
