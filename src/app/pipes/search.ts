/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], filter: String, orderBy: string): any {
    if (!items || !filter) {
    }
    const orderByName = this.getFilterName(orderBy);
    const filterArray = items.filter(
      item =>
        item.text.toUpperCase().indexOf(filter.toUpperCase()) !== -1 ||
        item.title.toUpperCase().indexOf(filter.toUpperCase()) !== -1
    );
    if (orderBy == '최신순') {
      return filterArray.sort((a, b) => {
        const d1 = new Date(a.dateLiked);
        const d2 = new Date(b.dateLiked);
        return d1 > d2 ? -1 : d2 > d1 ? 1 : 0;
      });
    }

    return filterArray.sort((a, b) => {
      const d1 = a[orderByName];
      const d2 = b[orderByName];
      return d1 > d2 ? -1 : d2 > d1 ? 1 : 0;
    });
  }

  getFilterName(orderBy) {
    switch (orderBy) {
      case '최신순':
        return 'dateCreated';
      case '추천순':
        return 'recommendPoint';
      case '조회수순':
        return 'checkUserNumber';
      default:
        break;
    }
  }
}
