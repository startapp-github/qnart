import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the SearchPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'searchUser',
})
export class SearchUserPipe implements PipeTransform {
  transform(items: any[], filter: String): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter((item) =>
      item.nickName || item.name
        ? (item.nickName || item.name)
            .toUpperCase()
            .indexOf(filter.toUpperCase()) !== -1
        : null
    );
  }
}
