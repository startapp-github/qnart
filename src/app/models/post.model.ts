/** @format */

export interface Post {
  id?: string;
  title: string;
  text: string;
  images: string[];
  dateCreated: string;
  createdBy: string;
  checkedUsers: string[];
  likedUsers: string[];
  isDeleted: boolean;
  categoryId: string;
  checkUserNumber: number;
  recommendPoint: number;
  isDisplay: boolean;
}
