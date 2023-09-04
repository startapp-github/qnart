import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MySubjectPage } from './my-subject.page';

const routes: Routes = [
  {
    path: '',
    component: MySubjectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MySubjectPageRoutingModule {}
