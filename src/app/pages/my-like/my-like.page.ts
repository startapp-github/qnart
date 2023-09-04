/** @format */

import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Post } from 'src/app/models/post.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-my-like',
  templateUrl: './my-like.page.html',
  styleUrls: ['./my-like.page.scss'],
})
export class MyLikePage implements OnInit {
  likedPostList;
  constructor(
    public navCtrl: NavController,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    this.likedPostList = await this.dataService.getLikedPosts();
    console.log('this.likedPostList', this.likedPostList);
  }

  async goFeedDetail(post: Post) {
    const postData = await this.dataService.getFeedTypePostByPostId(post.id);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        post: JSON.stringify(postData),
        type: 'detail',
      },
    };
    this.navCtrl.navigateForward(['/feed-detail'], navigationExtras);
  }
}
