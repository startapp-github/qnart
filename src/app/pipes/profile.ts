import { Pipe, PipeTransform } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'profile',
})
export class ProfilePipe implements PipeTransform {
  constructor(public db: DbService) {}
  transform(value: any, type: any): any {
    return this.db.doc$(`users/${value}`).pipe(
      map((user: any) => {
        // return type == 'image' ? user.img : user.nickName;
        return type == 'image' ? user.img || user.image : user.nickName;
      })
    );
  }
}
