export interface inquiry {
  inquiryId: string;
  userId: string;
  productId: string;
  category: string;
  content: string;
  photoList: Array<string>;
  dateCreated: string;
  isSecret: boolean;
  isAnswer: boolean;
  answerDate: string;
  answerContent: string;
  answerUserId: string;
}

export class Inquiry {
  private _inquiry: inquiry;

  constructor() {
    this._inquiry = {
      inquiryId: '',
      userId: '',
      productId: '',
      category: '',
      content: '',
      photoList: [],
      dateCreated: '',
      isSecret: false,
      isAnswer: false,
      answerDate: '',
      answerContent: '',
      answerUserId: '',
    };
  }

  get inquiry() {
    return this._inquiry;
  }

  set inquiry(inquiry: inquiry) {
    this._inquiry = inquiry;
  }
}
