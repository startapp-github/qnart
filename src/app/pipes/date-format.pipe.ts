/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
// import 'moment/locale/ko';
moment.locale('ko');

moment.locale('ko', {
  relativeTime: {
    s: '방금',
    m: '1분',
    mm: '%d분',
    h: '1시간',
    hh: '%d시간',
  },
});

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(date: any, type?: any): any {
    const today = moment().format('YYYY-MM-DD');
    const newDate = moment(new Date(date)).format('YYYY-MM-DD');
    if (type == 'chat') {
      if (!moment(today).isSame(newDate)) {
        if (moment(today).format('YYYY') == moment(new Date(date)).format('YYYY')) {
          return moment(new Date(date)).format('M월 DD일');
        } else {
          return moment(new Date(date)).format('YYYY년 M월 DD일');
        }
      } else {
        return moment(date).format('a h:mm');
      }
    } else {
      if (!moment(today).isSame(newDate)) {
        if (moment(today).format('YYYY') == moment(new Date(date)).format('YYYY')) {
          return moment(new Date(date)).format('M월 DD일');
        } else {
          return moment(new Date(date)).format('YYYY년 M월 DD일');
        }
      } else {
        return moment(new Date(date)).fromNow();
      }
    }
  }
}
