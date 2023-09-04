import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { DbService } from 'src/app/services/db.service';

@Pipe({
  name: 'nickName',
})
export class nickNamePipe implements PipeTransform {
  constructor(public db: DbService) {}
  transform(data: any): any {
    if (data && data.length > 0) {
      return this.db
        .collection$(`users`, (ref) => ref.where('nickName', '==', data))
        .pipe(
          map((tmpUser: any) => {
            let user = tmpUser[0];

            if ((data && data.length < 2) || data.indexOf(' ') > -1) {
              return {
                text: '닉네임은 최소 1자 이상부터 입력가능하고 뛰어쓰기는 불가능합니다.',
                type: 'error',
              };
            } else {
              if (
                tmpUser &&
                tmpUser.length > 0 &&
                user.id !== localStorage.getItem('userId')
              ) {
                return {
                  text: data + '은/는 이미 사용중인 닉네임입니다.',
                  type: 'error',
                };
              } else if (tmpUser && tmpUser.length == 0) {
                return {
                  text: data + '은/는 사용가능한 닉네임입니다.',
                  type: 'done',
                };
              }
            }
          })
        );
    }
  }
}
