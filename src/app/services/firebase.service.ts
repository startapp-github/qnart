import { Injectable } from '@angular/core';
import { combineLatest, defer, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { arrayUnion, arrayRemove } from 'firebase/firestore';

// //trackBy

// /**
//  *  post 안에 userId만 존재할 경우 user 정보를 엮는 경우
//  * @param afs
//  * @param field
//  * @param collection
//  */

export const leftJoinDocument = (afs: AngularFirestore, field, collection) => {
  return (source) =>
    defer(() => {
      // Operator state
      let collectionData;
      const cache = new Map();

      return source.pipe(
        switchMap((data) => {
          cache.clear();
          collectionData = data as any[]; // array

          const reads$ = [];
          let i = 0;
          for (const doc of collectionData) {
            if (!doc[field] || cache.get(doc[field])) {
              // {}에 filed가 없는경우
              continue;
            }

            reads$.push(
              afs.collection(collection).doc(doc[field]).valueChanges()
            );
            cache.set(doc[field], i);
            i++;
          }

          return reads$.length ? combineLatest(reads$) : of([]);
        }),
        map((joins) => {
          return collectionData.map((v) => {
            const joinIdx = cache.get(v[field]); // 고유ID
            return { ...v, [field]: joins[joinIdx] || null };
          });
        })
      );
    });
};

/**
 *  product안에 product안에 category 아이디를 가지고 있고 이를 엮는 경우
 *  field가 default값이 되어야합니다.
 * @param afs
 * @param field
 * @param collection
 */

export const docJoin = (
  afs: AngularFirestore,
  field: string,
  collection: string
) => {
  return (source) =>
    defer(() => {
      let docData;
      return source.pipe(
        switchMap((data) => {
          docData = data; // object
          const id = data[field];

          return afs
            .doc(`${collection}/${id}`) // 카테고리의 collection 이름과 id
            .snapshotChanges()
            .pipe(
              map((doc) => {
                return doc.payload.data() || null;
              })
            );
        }),
        map((fieldData) => {
          return fieldData ? { [field]: fieldData, ...docData } : docData;
        })
      );
    });
};

/**
 * post 안에 comment id를 Array로 가지고 있고 이를 엮는 경우
 * @param afs
 * @param field
 */

export const ArrayJoin = (afs: AngularFirestore, field: string) => {
  return (source) =>
    defer(() => {
      let docData;
      return source.pipe(
        switchMap((data) => {
          if (data) {
            docData = data; // object

            const arr = data[field]; // array
            let reads$: any = [];
            if (arr && arr.length > 0) {
              // array 가 존재할 경우
              for (const id of arr) {
                const docs$ = afs
                  .collection(`users`, (ref) =>
                    ref
                      .where('phone', '==', id.phone)
                      .where('exitSwitch', '==', false)
                  )
                  .snapshotChanges()
                  .pipe(
                    map((result: any) => {
                      if (result && result.length > 0) {
                        const data: any = result[0].payload.doc.data();
                        const docId = result[0].payload.doc.id;

                        return {
                          ...data,
                        };
                      } else {
                        return { ...id };
                      }
                    })
                  );
              }
            }

            return combineLatest(reads$);
          } else {
            return of([]);
          }
        }),
        map((arr) => {
          return { ...docData, [field]: arr };
        })
      );
    });
};

export const ArrayleftJoinDocument = (
  afs: AngularFirestore,
  field,
  collection
) => {
  return (source) =>
    defer(() => {
      // Operator state
      let collectionData;
      let real: any;
      const cache = new Map();
      return source.pipe(
        switchMap((data) => {
          real = data;
          // Clear mapping on each emitted val ;
          cache.clear();

          // Save the parent data state
          collectionData = data as any[];
          const reads$ = [];
          let i = 0;
          for (const doc of collectionData) {
            // Skip if doc field does not exist or is already in cache
            if (!doc[field]) {
              continue;
            }
            for (const item of doc[field]) {
              if (cache.get(item)) {
                continue;
              }
              // Push doc read to Array
              reads$.push(afs.collection(collection).doc(item).valueChanges());
              cache.set(item, i);
              i++;
            }
          }

          return reads$.length ? combineLatest(reads$) : of([]);
        }),
        map((joins) => {
          return collectionData.map((v) => {
            const array = [];
            for (const item2 of v[field]) {
              const joinIdx = cache.get(item2);
              array.push({ ...joins[joinIdx], id: item2 });
            }
            if (field) {
              return {
                ...v,
                [field]: array || [],
              };
            } else {
              return v;
            }
          });
        })
      );
    });
};

/**
 *  post가 가지고 있는 모든 comment를 가져오는 경우
 *
 * post$.pipe(
 *  withLatestFrom(this.db.collection(`comment`,ref=> ref.where("postId","==",this.postId).where("deleteSwtcih","==",false)),
 *  map(([post, comment]) => ({ comment, ...post })),
).subscribe(restaurant => { })
*/

/**
 *  최종 합산 데이터 누적 또는 삭제 경우
 * total: increment(1),

*/

/**
 * 업데이트를 꼭 write 완료 후에 업데이트 & 실패 시 업데이트도 실패해야한다면. (참고)
 *
 *
 * export const logActivityBreakCompletion = (duration: number, opts?: { date?: Date, goal?: number }) => {
  const batch = firestore().batch()   // create write batch

  logActivityBreakHistory(data, {
    goal: opts?.goal,
    batch
  })

  setUser({
    stats: {
      activityBreak: {
        sessions: increment(1),
      }
    }
  }, batch)

  return batch.commit()
}

 */

@Injectable({
  providedIn: 'root',
})

// ** 기본적인 DB처리 **//

// c r u d
export class DbService {
  constructor(public afs: AngularFirestore) {}

  collection$(path, query?) {
    //r
    return this.afs
      .collection(path, query)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id: id, ...data };
          });
        })
      );
  }

  doc$(path) {
    // r
    return this.afs
      .doc(path)
      .snapshotChanges()
      .pipe(
        map((doc) => {
          const data: any = doc.payload.data();
          const id = doc.payload.id;
          return { id: id, ...data };
        })
      );
  }

  updateAt(path: string, data: Object): Promise<any> {
    // c, u
    const segments = path.split('/').filter((v) => v);
    if (segments.length % 2) {
      return this.afs.collection(path).add(data);
    } else {
      return this.afs.doc(path).set(data, { merge: true });
    }
  }

  delete(path) {
    // d
    return this.afs.doc(path).delete();
  }

  /** 가져와서 혼자서만< 방해없이< 바로 업데이트 합니다.
   * transaction이 진행되는 동안에는 다른 update의 방해를 받지 않습니다.
   * 번호표 뽑기의 경우 동시에 '번호표 받기'버튼을 눌러서 동시에 업데이트를 하는 경우
   * 둘이 같은 번호를 받을 수도 있습니다.
   * 이 경우 먼저 들어온 trasaction이 순차적으로 진행됩니다.
   */
  likeAddTransaction() {
    let check = false;

    this.afs.firestore.runTransaction((transaction) => {
      return transaction
        .get(this.afs.firestore.collection('users').doc('this.uid'))
        .then((eventDoc) => {
          // 현재! db의 유저정보를 가져온다.
          if (check) {
            // 유저가 좋아요를 이미 눌렀던 경우
            return transaction.set(
              this.afs.firestore.collection('users').doc('this.uid'),
              {
                productLiked: arrayRemove('this.product.id'),
              },
              { merge: true }
            );
          } else {
            // 유저가 좋아요를 새로 누른경우
            return transaction.set(
              this.afs.firestore.collection('users').doc('this.uid'),
              {
                productLiked: arrayUnion('post23'),
              },
              { merge: true }
            );
          }
        });
    });
  }
}
