import {product} from './product';

export interface exhibition {
  exhibitionId: string;
  title: string;
  content: string;
  photo: string;
  detailPhoto: string;
  dateStart: string;
  dateEnd: string;
  productList: Array<string>;
  dateCreated: string;
}
