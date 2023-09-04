/** @format */

import { User } from './user.models';

export interface Comment {
  id?: string;
  recomments?: Comment[];
  text: string;
  dateCreated: string;
  type: string;
  userId: string | User;
  postId: string;
  refCommentId: string;
  likedUsers: string[];
  blockedUsers: string[];
}
