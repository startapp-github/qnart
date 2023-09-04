import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MySubjectPageRoutingModule } from './my-subject-routing.module';

import { MySubjectPage } from './my-subject.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MySubjectPageRoutingModule
  ],
  declarations: [MySubjectPage]
})
export class MySubjectPageModule {}
