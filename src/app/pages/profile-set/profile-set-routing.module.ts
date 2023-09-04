import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileSetPage } from './profile-set.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileSetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileSetPageRoutingModule {}
