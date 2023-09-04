/** @format */

import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-comment-correct',
  templateUrl: './comment-correct.page.html',
  styleUrls: ['./comment-correct.page.scss'],
})
export class CommentCorrectPage implements OnInit {
  @Input() myComment;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  correct() {
    this.modalCtrl.dismiss(this.myComment);
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
