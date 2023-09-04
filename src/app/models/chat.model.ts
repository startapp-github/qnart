/** @format */

import { User } from './user.models';

export interface Chat {
  id?: string;
  dateCreated: string;
  messages: Array<ChatMessage>;
  uid: Array<string>;
  exitUsers?: Array<string>;
  partner?: User; // 1:1의 경우
  partners?: Array<User>; // group채팅의 경우
  type?: string; // 1:1 | group
}

export interface ChatUser {
  startIndex: number;
  readIndex: number;
  partner: User;
}

export interface ChatMessage {
  dateCreated: string;
  type: string;
  content: string | string[];
  uid: string;
}

export interface ChatList {
  id: string;
  dateCreated: string;
  partner: string | User | Array<string | User>;
  lastChat: ChatMessage;
  messageLength: number;
  myInfo: ChatUser;
  unRead?: number;
  type?: string;
}
