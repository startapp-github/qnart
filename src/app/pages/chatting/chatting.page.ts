/** @format */

import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import * as firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { ChatList } from 'src/app/models/chat.model';
import { AlertService } from 'src/app/services/alert.service';
import { ChatService } from 'src/app/services/chat.service';
import { CommonService } from 'src/app/services/common.service';
import { DbService } from 'src/app/services/db.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-chatting',
  templateUrl: './chatting.page.html',
  styleUrls: ['./chatting.page.scss'],
})
export class ChattingPage implements OnInit {
  @ViewChild('content') content: IonContent;
  chatList$: Observable<ChatList[]>;

  constructor(
    private alert: AlertService,
    public navCtrl: NavController,
    private cs: ChatService,
    private db: DbService,
    private userService: UserService,
    public common: CommonService
  ) {}

  async ngOnInit() {
    await this.userService.inIt();
    this.getData();
  }

  ionViewWillEnter() {
    this.content.scrollToTop();
  }

  async getData() {
    this.chatList$ = this.cs.getChatList();
  }

  // 채팅방 나가기 Alert
  userChatOutAlert(chat) {
    this.alert
      .cancelOkBtn(
        'alert confirm',
        `채팅방을 나가시겠습니까?<br>나가기를 하면 대화내용이 모두<br>삭제되고 채팅 목록에서도 삭제됩니다.`
      )
      .then(async (res) => {
        if (res) {
          if (chat.messageLength === 0) {
            await this.db.updateAt(`chats/${chat.id}`, {
              exitUsers: firebase.default.firestore.FieldValue.arrayUnion(
                this.userService.userData.id
              ),
            });
          } else {
            await this.cs.setStartIndex(chat.id, chat.messageLength);
          }
          this.alert.toast('나가기 했습니다.', 'toast');
        }
      });
  }

  goChatDetail(chat) {
    this.navCtrl.navigateForward(['/chatting-detail'], {
      queryParams: { id: chat.id },
    });
  }
}
