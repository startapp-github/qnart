/** @format */

import { NgModule } from '@angular/core';
import { DateFormatPipe } from './date-format.pipe';
import { CommonModule } from '@angular/common';
import { SearchPipe } from './search';
import { OrderByPipe } from './order-by';
import { SearchUserPipe } from './searchUser';
import { nickNamePipe } from './nickname';
import { ProfilePipe } from './profile';
import { MissionPipe } from './mission';
import { DocPipe } from './doc.pipe';
import { ColPipe } from './col.pipe';
import { FriendFollowPipe } from './friendFollow';
import { PartnerFormatPipe } from './partner-format.pipe';
import { ThumbsPipe } from './thumbs.pipe';

@NgModule({
  declarations: [
    DateFormatPipe,
    SearchPipe,
    OrderByPipe,
    SearchUserPipe,
    nickNamePipe,
    ProfilePipe,
    MissionPipe,
    DocPipe,
    ColPipe,
    FriendFollowPipe,
    PartnerFormatPipe,
    ThumbsPipe,
  ],
  imports: [CommonModule],
  exports: [
    DateFormatPipe,
    SearchPipe,
    OrderByPipe,
    SearchUserPipe,
    nickNamePipe,
    ProfilePipe,
    MissionPipe,
    DocPipe,
    ColPipe,
    FriendFollowPipe,
    PartnerFormatPipe,
    ThumbsPipe,
  ],
})
export class PipesModule {}
