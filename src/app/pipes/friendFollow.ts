/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { DbService } from 'src/app/services/db.service';

@Pipe({
  name: 'firenFollow',
})
export class FriendFollowPipe implements PipeTransform {
  constructor(private db: DbService) {}

  transform(value: any, array: any[]): any {
    let tmp = this.db.doc$(`users/${value}`).pipe(
      map((e: any) => {
        if (e && e.email) {
          if (array.findIndex((i) => i == value) > -1) {
            e.followingSwitch = true;
          } else {
            e.followingSwitch = false;
          }

          return e;
        } else {
          return false;
        }
      })
    );

    return tmp;
  }
}
