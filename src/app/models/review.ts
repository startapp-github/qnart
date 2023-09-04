export interface Review {
  id: string;
  grade: number;
  content: string;
  images: Array<any>;
  dateCreated: string;
  userId: string;
  orderId: string;
  answer: string;
  deleteSwitch: boolean;
  answerSwitch: boolean;
  answerDate: string;
  cartId: string;
}
