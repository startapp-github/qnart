/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { Post } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.models';
import { DataService } from 'src/app/services/data.service';
interface Item {
  blockedUsers?: string[];
  dateCreated: string;
  id: string;
  likedUsers?: string[];
  postCreatedBy?: User;
  postId?: Post;
  refCommentId?: string;
  text: string;
  userId?: string;
  categoryId?: string;
  checkUserNumber?: number;
  checkedUsers?: string;
  createdBy?: string;
  images?: string[];
  isDeleted?: boolean;
  recommendPoint?: number;
  title?: string;
  type: string;
}
@Component({
  selector: 'app-my-write',
  templateUrl: './my-write.page.html',
  styleUrls: ['./my-write.page.scss'],
})
export class MyWritePage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: false })
  infiniteScroll: IonInfiniteScroll;

  allContent: Item[];
  lastIndex = 10;
  constructor(
    public navCtrl: NavController,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    await this.dataService.inIt();
    this.allContent = await this.dataService.getAllContentsWrittenByUser();
    console.log('this.allContent', this.allContent);
  }

  // 게시글을 게시글, 댓글은 게시글에 작성한 해당 댓글로..
  async goFeedDetail(item: Item) {
    if (item.type == 'post') {
      const postData = await this.dataService.getFeedTypePostByPostId(item.id);
      let navigationExtras: NavigationExtras = {
        queryParams: {
          post: JSON.stringify(postData),
          type: 'detail',
        },
      };
      this.navCtrl.navigateForward(['/feed-detail'], navigationExtras);
    } else {
      const postData = await this.dataService.getFeedTypePostByPostId(
        item.postId.id
      );
      const comment = await this.dataService.getFeedTypeComment(
        postData,
        item.id
      );
      let navigationExtras: NavigationExtras = {
        queryParams: {
          comment: JSON.stringify(comment),
          post: JSON.stringify(postData),
        },
      };
      this.navCtrl.navigateForward(['/feed-reply'], navigationExtras);
    }
  }

  async findNext($event) {
    setTimeout(async () => {
      this.lastIndex = this.lastIndex + 10;
      if (this.allContent.length < this.lastIndex) {
        this.infiniteScroll.disabled = true;
      }
      $event.target.complete();
    }, 500);
  }
}
