/** @format */

import { Inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { first, map, switchMap, take } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { NavController } from '@ionic/angular';
import { DbService } from './db.service';
import * as firebase from 'firebase/compat/app';
import {
  Chat,
  ChatList,
  ChatMessage,
  ChatUser,
} from 'src/app/models/chat.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CommonService } from './common.service';
import { AlarmService } from './alarm.service';
import { UserService } from './user.service';
import { User } from 'src/app/models/user.models';
import { PushService } from './push.service';
import * as _ from 'lodash';
import { FIREBASE_REFERENCES } from 'src/app/core/firebase/firebase.module';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    @Inject(FIREBASE_REFERENCES.ONE_FIRESTORE) public afs: AngularFirestore,
    @Inject(FIREBASE_REFERENCES.ONE_FIREAUTH) public afAuth: AngularFireAuth,
    public navc: NavController,
    public db: DbService,

    private common: CommonService,
    private userService: UserService,
    private alarmService: AlarmService,
    private push: PushService
  ) {}

  subscribeSwitch: boolean = false;

  /**
   * 1:1 채팅방 생성
   *
   * @param partner 채팅방을 만들 상대의 id
   * @param type 채팅방 종류 (매칭, 실종신고)
   * @param isOpen 채팅방 오픈 유무
   */
  async createChat(partner: User, isOpen?: boolean): Promise<void> {
    let user = this.userService.userData;
    // const partnerSet = partner === 'masterInfo' ? 'masterInfo' : partner.uid;
    const uids = [user.uid, partner.uid];

    console.log({ uids });

    // console.log('partner.uid', partner.uid);
    // console.log('uids', uids);

    let myChat = await this.db
      // .collection$('chats', ref => ref.where('uid', 'array-contains', user.uid))
      .collection$('chats', (ref) => ref.where('uid', 'in', uids))
      .pipe(take(1))
      .toPromise();

    console.log('myChat', myChat);

    // let chats = myChat.filter(chat => chat.uid.indexOf(partner.uid) > -1);
    let chats = myChat.filter((chat) => {
      console.log('chat', chat);

      if (
        chat.uid.length < 3 &&
        chat.uid.length > 0 &&
        chat.uid.includes(partner.uid)
        // &&
        // !chat.exitUsers?.includes(user.uid)
      ) {
        return true;
      } else {
        return false;
      }
    });

    console.log('chats', chats);

    if (chats.length > 0 || chats[0]?.exitUsers?.length < 2) {
      if (isOpen) {
        if (
          chats[0].exitUsers &&
          chats[0].exitUsers.length > 0 &&
          chats[0].exitUsers.includes(user.uid)
        ) {
          console.log('chats[0]', chats[0]);

          const messageLength = chats[0].messages
            ? chats[0].messages.length
            : 0;

          this.db.updateAt(`chats/${chats[0].id}`, {
            exitUsers: [],
            [user.uid]: {
              readIndex: messageLength,
              startIndex: messageLength,
              partner: partner.uid,
            },
          });
        }

        this.navc.navigateForward('/chatting-detail', {
          queryParams: {
            id: chats[0].id,
          },
        });
      }
      return;
    } else {
      const chat: Chat = {
        id: this.common.generateFilename(),
        messages: [],
        dateCreated: new Date().toISOString(),
        uid: [user.uid, partner.uid],
        [user.uid]: { readIndex: 0, startIndex: 0, partner: partner.uid },
        [partner.uid]: { readIndex: 0, startIndex: 0, partner: user.uid },
        exitUsers: [],
      };
      const newAlarm = {
        userId: partner.uid,
        title: '새로운 채팅이 시작되었습니다.',
        content: this.userService.userData.nickName + '님이 대화시작',
        data: {
          type: 'chat',
          typeId: chat.id,
          typeId2: '',
        },
      };

      this.push
        .sendPush(partner.pushId, '채팅 알림', '새로운 채팅이 도착했어요.', {
          type: 'chat',
          typeId: chat.id,
        })
        .then((e) => {
          console.log('push', e);
        });

      this.alarmService.sendAlarm(
        newAlarm.userId,
        partner.nickName,
        '새로운 채팅이 도착했어요.',
        newAlarm.content,
        newAlarm.data
      );
      await this.db.updateAt(`chats/${chat.id}`, chat);

      if (isOpen) {
        this.navc.navigateForward('/chatting-detail', {
          queryParams: {
            id: chat.id,
          },
        });
      }
      return;
    }
  }

  /**
   * 그룹채팅방 생성
   *
   * @param uids 그룹방을 생성할 user들의 id
   */
  async createGroupChat(uids: Array<string>): Promise<void> {
    let user = this.userService.userData;
    let myUid = user.uid;

    const allUids = [...uids, user.uid];

    let myChat = await this.db
      // .collection$('chats', ref => ref.where('uid', 'array-contains', user.uid))
      .collection$('chats', (ref) =>
        ref.where('uid', 'array-contains-any', allUids)
      )
      .pipe(take(1))
      .toPromise();

    let chats = myChat.filter((chat) => {
      if (_.isEqual(chat.uid, allUids)) {
        return true;
      } else {
        return false;
      }
    });

    if (chats.length > 0) {
      chats.forEach((chat) => {
        const uids = [...chat.uid, myUid];

        console.log(uids);
      });

      this.navc.navigateForward('/chatting-detail', {
        queryParams: {
          id: chats[0].id,
        },
      });
    } else {
      let chat: Chat = {
        id: this.common.generateFilename(),
        messages: [],
        dateCreated: new Date().toISOString(),
        uid: [...uids, myUid],
        [myUid]: { readIndex: 0, startIndex: 0 },
        type: 'group',
      };

      const promise = uids.map((uid) => {
        return (chat[uid] = { readIndex: 0, startIndex: 0 });
      });

      await Promise.all(promise);

      await this.db.updateAt(`chats/${chat.id}`, chat);

      this.navc
        .navigateForward('/chatting-detail', {
          queryParams: {
            id: chat.id,
          },
        })
        .then(() => {
          uids.forEach((uid) => {
            this.db
              .doc$(`users/${uid}`)
              .pipe(take(1))
              .subscribe((user) => {
                const newAlarm = {
                  userId: user.uid,
                  title: '새로운 채팅이 시작되었습니다.',
                  content: '그룹 채팅 대화시작',
                  data: {
                    type: 'chat',
                    typeId: chat.id,
                    typeId2: '',
                  },
                };

                this.alarmService.sendAlarm(
                  newAlarm.userId,
                  '그룹채팅',
                  '새로운 채팅이 도착했어요.',
                  newAlarm.content,
                  newAlarm.data
                );

                this.push
                  .sendPush(
                    user.pushId,
                    '채팅 알림',
                    '새로운 채팅이 도착했어요.',
                    {
                      type: 'chat',
                      typeId: chat.id,
                    }
                  )
                  .then((e) => {
                    console.log('push', e);
                  });
              });
          });
        });
    }
  }

  /**
   *
   * @param chatId 유저를 초대하려는 chat의 id
   * @param uids 단체채팅방에 추가하려는 유저
   */
  async addUser(chatId: string, uids: Array<string>): Promise<void> {
    let user = this.userService.userData;
    let myUid = user.uid;
    let chat: Chat = await this.db
      .doc$(`chats/${chatId}`)
      .pipe(take(1))
      .toPromise();
    if (chat.type && chat.type === 'group') {
      // 진짜 유저 추가!
      // let updateChat = {};
      uids.forEach((partnerId) => {
        console.log({ partnerId });

        this.db
          .updateAt(`chats/${chatId}`, {
            [partnerId]: {
              readIndex: chat.messages.length,
              startIndex: chat.messages.length,
            },
            uid: firebase.default.firestore.FieldValue.arrayUnion(partnerId),
          })
          .then(() => {
            this.db
              .doc$(`users/${partnerId}`)
              .pipe(take(1))
              .subscribe((user) => {
                this.push
                  .sendPush(
                    user.pushId,
                    '채팅 알림',
                    '새로운 채팅이 도착했어요.',
                    {
                      type: 'chat',
                      typeId: chat.id,
                    }
                  )
                  .then((e) => {
                    console.log('push', e);
                  });
              });
          });

        const data: ChatMessage = {
          uid: '',
          content: '새로운 대화상대가 추가되었습니다.',
          dateCreated: new Date().toISOString(),
          type: 'add',
        };

        this.db.updateAt(`chats/${chatId}`, {
          messages: firebase.default.firestore.FieldValue.arrayUnion(data),
        });

        // updateChat[uid] = { readIndex: chat.messages.length, startIndex: 0 };
        // chat.uid.push(uid);
      });
    } else {
      // 여기는 단체채팅방 생성
      // this.createGroupChat(uids);

      //생성하면 안되고...
      uids.forEach((partnerId) => {
        this.db
          .updateAt(`chats/${chatId}`, {
            [partnerId]: {
              readIndex: chat.messages.length,
              startIndex: chat.messages.length,
            },
            uid: firebase.default.firestore.FieldValue.arrayUnion(partnerId),
            type: 'group',
          })
          .then(() => {
            this.db
              .doc$(`users/${partnerId}`)
              .pipe(take(1))
              .subscribe((user) => {
                this.push
                  .sendPush(
                    user.pushId,
                    '채팅 알림',
                    '새로운 채팅이 도착했어요.',
                    {
                      type: 'chat',
                      typeId: chat.id,
                    }
                  )
                  .then((e) => {
                    console.log('push', e);
                  });
              });
          });
      });

      const data: ChatMessage = {
        uid: '',
        content: '새로운 대화상대가 추가되었습니다.',
        dateCreated: new Date().toISOString(),
        type: 'add',
      };

      this.db.updateAt(`chats/${chatId}`, {
        messages: firebase.default.firestore.FieldValue.arrayUnion(data),
      });
    }
  }

  // 채팅리스트 가져오기
  getChatList(): Observable<Array<ChatList>> {
    const myUid = this.userService.userData.id;
    const users$ = this.db.doc$(`users/${myUid}`);
    const chats$ = this.db.afs
      .collection<Chat>('chats', (ref) =>
        ref.where('uid', 'array-contains', myUid)
      )
      .valueChanges({ idField: 'id' });

    return combineLatest([users$, chats$]).pipe(
      map(([user, chats]: [User, Array<Chat>]) => {
        console.log('user', user);
        console.log('chats', chats);

        let chatLists: Array<ChatList> = chats
          .filter((chat) => {
            const partner = chat.uid.filter((e) => e !== myUid)[0];
            return (
              (!chat.exitUsers || !chat.exitUsers.includes(myUid)) &&
              (user.blockedUsers.length === 0 ||
                !user.blockedUsers.includes(partner))
            );
          })
          .map((chat) => {
            console.log({ chat });

            console.log('  chat[myUid].startIndex ', chat[myUid].startIndex);

            if (chat.type && chat.type === 'group') {
              let partner = chat.uid.filter((e) => e !== myUid);

              let chatLength = chat.messages.length;
              let unRead =
                chat.messages.length > 0
                  ? chat.messages.length - chat[myUid].readIndex
                  : 0;
              let result: ChatList = {
                id: chat.id,
                dateCreated: chat.dateCreated,
                partner,
                // lastChat: chat.messages[chatLength - 1],
                lastChat:
                  chat[myUid].startIndex == chatLength
                    ? null
                    : chat.messages[chatLength - 1],
                messageLength: chatLength,
                myInfo: chat[myUid],
                type: 'group',
                unRead,
              };

              console.log({ result });

              return result;
            } else {
              let partner = chat.uid.filter((e) => e !== myUid)[0];
              let chatLength = chat.messages.length;
              let unRead =
                chat.messages.length > 0
                  ? chat.messages.length - chat[myUid].readIndex
                  : 0;
              let result: ChatList = {
                id: chat.id,
                dateCreated: chat.dateCreated,
                partner,
                // lastChat: chat.messages[chatLength - 1],
                lastChat:
                  chat[myUid].startIndex == chatLength
                    ? null
                    : chat.messages[chatLength - 1],
                messageLength: chatLength,
                myInfo: chat[myUid],
                unRead,
              };
              console.log({ result });
              return result;
            }
          });
        return chatLists;
      }),
      switchMap((chatList) => {
        if (chatList.length > 0) {
          const users = chatList.map((ct) => {
            return { uid: ct.partner, chatId: ct.id };
          });
          return combineLatest(
            of(chatList),
            combineLatest(
              users.map((chat) => {
                if (typeof chat.uid == 'string') {
                  return this.db.afs
                    .doc<User>(`users/${chat.uid}`)
                    .valueChanges({ idField: 'id' })
                    .pipe(
                      map((user) => {
                        return { chatId: chat.chatId, user };
                      })
                    );
                } else {
                  return this.db.afs
                    .collection<User>('users', (ref) =>
                      ref.where('uid', 'in', chat.uid)
                    )
                    .valueChanges({ idField: 'id' })
                    .pipe(
                      map((user) => {
                        return { chatId: chat.chatId, user };
                      })
                    );
                }
              })
            )
          );
        } else {
          return combineLatest(of(chatList), of([]));
        }
      }),
      map(([chatLists, users]) => {
        const setIist = chatLists.map((chatList: ChatList) => {
          let partner = users.find((user) => user?.chatId === chatList.id).user;
          chatList['lastTime'] = chatList.lastChat
            ? chatList.lastChat.dateCreated
            : chatList.dateCreated;
          if (partner) {
            return {
              ...chatList,
              partner,
            };
          } else {
            return chatList;
          }
        });

        console.log({ setIist });

        return setIist.sort((a: any, b: any) => {
          return (
            new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
          );
        });
      })
    );
  }

  /**
   *
   * @param chatId 불러올 채팅의 id
   */
  getChat(chatId): Observable<Chat> {
    const myUid = this.userService.userData.id;
    return this.db.afs
      .collection<Chat>(`chats`)
      .doc(chatId)
      .valueChanges({ idField: 'id' })
      .pipe(
        switchMap((chat) => {
          if (chat) {
            if (chat.type && chat.type === 'group') {
              const partners = chat.uid.filter((e) => e !== myUid);
              return this.db.afs
                .collection<User>('users', (ref) =>
                  ref.where('uid', 'in', partners)
                )
                .valueChanges({ idField: 'id' })
                .pipe(
                  map((partners) => {
                    return { ...chat, partners };
                  })
                );
            } else {
              console.log({ chat });

              console.log({ myUid });

              const partner = chat[myUid]['partner'];

              console.log({ partner });

              return this.db.afs
                .doc<User>(`users/${partner}`)
                .valueChanges({ idField: 'id' })
                .pipe(
                  map((partner) => {
                    return { ...chat, partner };
                  })
                );
            }
          }
        })
      );
  }

  // 안읽은 채팅갯수(뱃지)
  getBadge(): Observable<Number> {
    let myUid = this.userService.userData.id;
    if (!myUid) {
      this.getBadge();
      return;
    }
    return this.db.afs
      .collection<Chat>('chats', (ref) =>
        ref.where('uid', 'array-contains', myUid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((chats: Array<Chat>) => {
          let unReads: number = 0;
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            if (chat.messages.length == chat[myUid].startIndex) {
              continue;
            }
            let unRead = chat.messages.length - chat[myUid].readIndex;
            unReads += unRead;
          }
          return unReads;
        })
      );
  }

  /**
   * 메세지 보내기
   *
   * @param chatId 채팅을 보내는 채팅방의 id
   * @param content 채팅 내용 (글 혹은 이미지 등)
   * @param type 보내는 채팅의 종류 (text | image)
   * @returns
   */
  async sendMessage(
    chatId: string,
    content: string | string[],
    type: string
  ): Promise<void> {
    let myUid = this.userService.userData.id;

    const data: ChatMessage = {
      uid: myUid,
      content,
      dateCreated: new Date().toISOString(),
      type: type,
    };

    if (myUid) {
      const ref = this.afs.collection('chats').doc(chatId);
      return ref.update({
        messages: firebase.default.firestore.FieldValue.arrayUnion(data),
        exitUsers: [],
      });
    }
  }

  /**
   * 채팅방 나가기
   *
   * @param chatId 채팅을 보내는 채팅방의 id
   * @param messageLength 채팅 내용 (글 혹은 이미지 등)
   * @returns
   */
  async setStartIndex(chatId: string, messageLength: number): Promise<void> {
    let myUid = this.userService.userData.id;
    let user = {
      readIndex: messageLength,
      startIndex: messageLength,
    };
    await this.db.updateAt(`chats/${chatId}`, { [myUid]: user });
    return;
  }
  /**
   * 채팅방 나가기
   *
   * @param chatId 채팅을 보내는 채팅방의 id
   * @param content 채팅 내용 (글 혹은 이미지 등)
   * @param type 보내는 채팅의 종류 (text | image)
   * @returns
   */
  async exitChat(chatId: string): Promise<void> {
    let myUid = this.userService.userData.id;
    await this.db.updateAt(`chats/${chatId}`, {
      uid: firebase.default.firestore.FieldValue.arrayRemove(myUid),
    });
    return;
  }
}
