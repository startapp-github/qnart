/** @format */

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.models';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.page.html',
  styleUrls: ['./black-list.page.scss'],
})
export class BlackListPage implements OnInit {
  list = [
    {
      nickname: '동민이',
      profile: 'assets/samples/sample-11.jpeg',
      blockOn: false,
    },
    {
      nickname: '거북이',
      profile: 'assets/imgs/icon-black-empty.png',
      blockOn: true,
    },
    {
      nickname: '바다거북바다',
      profile: 'assets/samples/sample-13.jpeg',
      blockOn: true,
    },
  ];
  blockUserList$: Observable<User[]>;
  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.userService.inIt();
    this.blockUserList$ = this.userService.getBlockUserList$();
  }

  userBlock(item) {
    this.userService.removeBlockUser(item.id);
  }
}
