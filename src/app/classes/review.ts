export interface review {
  reviewId: string;
  userId: string;
  detailId: string;
  productId: string;
  rate: number;
  content: string;
  photoList: Array<string>;
  dateCreated: string;
  isAnswer: boolean;
  answer: string;
  answerDate: string;
}

export class Review {
  private _review: review;
  constructor() {
    this._review = {
      reviewId: '',
      userId: '',
      detailId: '',
      productId: '',
      rate: null,
      content: '',
      photoList: [],
      dateCreated: '',
      isAnswer: false,
      answer: '',
      answerDate: '',
    };
  }

  get review() {
    return this._review;
  }

  set review(review: review) {
    this._review = review;
  }
}
