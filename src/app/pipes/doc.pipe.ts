/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DbService } from 'src/app/services/db.service';

@Pipe({
  name: 'doc',
})
export class DocPipe implements PipeTransform {
  constructor(private db: DbService) {}

  transform(value: any, ...args: any[]): any {
    return this.db.doc$(value);
  }
}
