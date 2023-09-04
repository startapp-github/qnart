/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'thumbs',
})
export class ThumbsPipe implements PipeTransform {
  storageBucket = environment.firebaseConfig['PROJECT-ONE'].storageBucket;

  thumbUrl = `https://storage.googleapis.com/${this.storageBucket}/post/`;
  constructor() {}

  transform(value: string): any {
    if (!value) {
      return '';
    }
    let replace = value.replace('_400x400', '');
    let newValue = replace.split('/');
    const indexOfFirst = newValue[newValue.length - 1].indexOf('.');
    let name =
      indexOfFirst == -1
        ? newValue[newValue.length - 1] + '.jpg'
        : newValue[newValue.length - 1];
    const filename = name.replace('.', '_400x400.');
    const newUrl = this.thumbUrl + filename;
    // FIXME 차후 resize Extension 추가하게 되면 return value를 -> return newUrl로 변경해주어야 합니다.
    return value;
  }
}
