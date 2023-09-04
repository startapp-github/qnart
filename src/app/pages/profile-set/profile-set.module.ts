/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileSetPageRoutingModule } from './profile-set-routing.module';

import { ProfileSetPage } from './profile-set.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ProfileSetPageRoutingModule],
  declarations: [ProfileSetPage],
})
export class ProfileSetPageModule {}
