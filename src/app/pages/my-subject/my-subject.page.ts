/** @format */

import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-my-subject',
  templateUrl: './my-subject.page.html',
  styleUrls: ['./my-subject.page.scss'],
})
export class MySubjectPage implements OnInit {
  constructor(
    public dataService: DataService,
    private userService: UserService
  ) {}

  ngOnInit() {}

  updateInterested(category: Category) {
    setTimeout(() => {
      console.log('updateInterested', category);
      if (category.checked) {
        this.userService.addInterestedCategory(category.id);
      } else {
        this.userService.removeInterestedCategory(category.id);
      }
    }, 500);
  }
}
