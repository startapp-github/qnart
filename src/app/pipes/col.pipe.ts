/** @format */

import { Inject, Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { FIREBASE_REFERENCES } from 'src/app/core/firebase/firebase.module';

@Pipe({
  name: 'col',
})
export class ColPipe implements PipeTransform {
  constructor(
    @Inject(FIREBASE_REFERENCES.ONE_FIRESTORE) public afs: AngularFirestore
  ) {}

  transform(value: any, path: any, query: any, ...args: any[]): any {
    return this.afs
      .collection(value, (ref) => ref.where(path, '==', query))
      .snapshotChanges()
      .pipe(
        map((actions: any) => {
          return actions.map((a) => {
            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }
}
