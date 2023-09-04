import { Pipe, PipeTransform } from '@angular/core';
import { User } from 'src/app/models/user.models';

@Pipe({
  name: 'partnerFormat',
})
export class PartnerFormatPipe implements PipeTransform {
  transform(value: Array<User>, msgUid: string, key: string): User | any {
    let result;

    if (msgUid !== 'all') {
      const partner = value.filter((user) => user.id == msgUid)[0];
      result = partner ? partner[key] : false;
    } else {
      const appPartner = value.filter((user) => user[key]);
      result = appPartner ? appPartner : [];
    }

    return result;
  }
}
