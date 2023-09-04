import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayCompletePage } from './pay-complete.page';

const routes: Routes = [
  {
    path: '',
    component: PayCompletePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayCompletePageRoutingModule {}
