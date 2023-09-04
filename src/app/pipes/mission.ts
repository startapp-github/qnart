import { Pipe, PipeTransform } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'mission',
})
export class MissionPipe implements PipeTransform {
  constructor(public db: DbService) {}
  transform(value: any, type: any): any {
    return this.db.doc$(`${type}/${value}`).pipe(
      map((e) => {
        return e;
      })
    );
  }
}
