/** @format */

import { Inject, Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Action,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { Observable, from, combineLatest, defer, of, pipe } from 'rxjs';
import {
  map,
  tap,
  take,
  switchMap,
  mergeMap,
  expand,
  takeWhile,
  debounceTime,
} from 'rxjs/operators';
import * as firebase from 'firebase/compat/app';
import { FIREBASE_REFERENCES } from 'src/app/core/firebase/firebase.module';

export const docJoin = (
  afs: AngularFirestore,
  paths: { [key: string]: string }
) => {
  return (source) =>
    defer(() => {
      let parent;
      const keys = Object.keys(paths);

      return source.pipe(
        switchMap((data) => {
          // Save the parent data state
          parent = data;

          // Map each path to an Observable
          const docs$ = keys.map((k) => {
            const fullPath = `${paths[k]}/${parent[k]}`;
            return afs.doc(fullPath).valueChanges();
          });

          // return combineLatest, it waits for all reads to finish
          return combineLatest(docs$);
        }),
        map((arr) => {
          // We now have all the associated douments
          // Reduce them to a single object based on the parent's keys
          const joins = keys.reduce((acc, cur, idx) => {
            return { ...acc, [cur]: arr[idx] };
          }, {});

          // Return the parent doc with the joined objects
          return { ...parent, ...joins };
        })
      );
    });
};
export const leftJoinOneDocument = (
  afs: AngularFirestore,
  field,
  collection
) => {
  return (source) =>
    defer(() => {
      let parent;

      return source.pipe(
        switchMap((data) => {
          // Save the parent data state
          parent = data;

          // Map each path to an Observable
          if (parent[field]) {
            const doc = afs
              .collection(collection)
              .doc(parent[field])
              .snapshotChanges()
              .pipe(
                map((doc) => {
                  const data: any = doc.payload.data();
                  const id = doc.payload.id;
                  return { id: doc.payload.id, ...data };
                })
              );

            return doc;
          }
          return of('');
        }),
        map((arr) => {
          return { ...parent, [field]: arr };
        })
      );
    });
};
export const leftArrayJoin = (afs: AngularFirestore, field, collection) => {
  return (source) =>
    defer(() => {
      let parent;

      return source.pipe(
        switchMap((data) => {
          parent = data;
          const array = parent[field] as any[];
          const reads$ = [];
          for (const item of array) {
            if (item) {
              const itemData = afs
                .collection(collection)
                .doc(parent[field])
                .snapshotChanges()
                .pipe(
                  map((doc) => {
                    const data: any = doc.payload.data();
                    return { id: doc.payload.id, ...data };
                  })
                );

              reads$.push(itemData);
            } else {
              reads$.push(of([]));
            }
          }
          return combineLatest(reads$);
        }),
        map((arr) => {
          return { ...parent, [field]: arr };
        })
      );
    });
};
export const getOnePostComments = (afs: AngularFirestore) => {
  return (source) =>
    defer(() => {
      // Operator state
      let parent;

      return source.pipe(
        switchMap((data) => {
          parent = data;

          if (parent) {
            const q = (ref) =>
              ref
                .where('postId', '==', parent.id)
                .orderBy('dateCreated', 'desc');
            const doc = afs
              .collection('comments', q)
              .snapshotChanges()
              .pipe(
                map((actions: any) => {
                  return actions.map((a: any) => {
                    const data: any = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data };
                  });
                })
              );
            return doc;
          }
          return of('');
        }),
        map((arr) => {
          return { ...parent, ['comments']: arr };
        })
      );
    });
};

export const getUsersById = (afs: AngularFirestore) => {
  return (source) =>
    defer(() => {
      // Operator state
      let idArray;
      return source.pipe(
        switchMap((data) => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          idArray = data as any[];

          const reads$ = [];
          if (idArray && idArray.length) {
            for (const userId of idArray) {
              // Push doc read to Array

              if (userId) {
                // Perform query on join key, with optional limit
                const userData = afs
                  .collection('users')
                  .doc(userId)
                  .snapshotChanges()
                  .pipe(
                    map((doc) => {
                      const data: any = doc.payload.data();
                      return { id: doc.payload.id, ...data };
                    })
                  );
                reads$.push(userData);
              } else {
                reads$.push(of([]));
              }
            }
            return combineLatest(reads$);
          } else {
            return of([]);
          }
        })
      );
    });
};

export const getComments = (afs: AngularFirestore) => {
  return (source) =>
    defer(() => {
      // Operator state
      let collectionData;

      // Track total num of joined doc reads
      let totalJoins = 0;

      return source.pipe(
        switchMap((data) => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          collectionData = data as any[];

          const reads$ = [];
          for (const doc of collectionData) {
            // Push doc read to Array

            if (doc) {
              // Perform query on join key, with optional limit
              const q = (ref) =>
                ref
                  .where('postId', '==', doc.id)
                  .orderBy('dateCreated', 'desc');
              reads$.push(
                afs
                  .collection('comments', q)
                  .snapshotChanges()
                  .pipe(
                    map((actions: any) => {
                      return actions.map((a: any) => {
                        const data: any = a.payload.doc.data();
                        const id = a.payload.doc.id;
                        return { id, ...data };
                      });
                    })
                  )
              );
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map((joins) => {
          return collectionData.map((v, i) => {
            totalJoins += joins[i].length;
            return { ...v, ['comments']: joins[i] || null };
          });
        })
      );
    });
};

export const getAlarmData = (afs: AngularFirestore) => {
  return (source) =>
    defer(() => {
      // Operator state
      let alarmList;

      // Track total num of joined doc reads
      let totalJoins = 0;

      return source.pipe(
        switchMap((data) => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          alarmList = data as any[];

          const reads$ = [];

          if (alarmList.length === 0) {
            reads$.push(of([]));
            return combineLatest(reads$);
          }

          for (const alarm of alarmList) {
            // Push doc read to Array

            if (alarm) {
              // Perform query on join key, with optional limit
              if (alarm.type == 'chat') {
                const chatData = afs
                  .collection('chats')
                  .doc(alarm.typeId)
                  .snapshotChanges()
                  .pipe(
                    map((doc) => {
                      const data: any = doc.payload.data();
                      return { id: doc.payload.id, ...data };
                    })
                  );
                reads$.push(chatData);
              } else if (alarm.type === 'comment') {
                const commentData = afs
                  .collection('comments')
                  .doc(alarm.typeId2)
                  .snapshotChanges()
                  .pipe(
                    map((doc) => {
                      const data: any = doc.payload.data();
                      return { id: doc.payload.id, ...data };
                    })
                  );
                reads$.push(commentData);
              } else {
                reads$.push(of(alarm));
              }
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map((joins) => {
          return alarmList.map((v, i) => {
            totalJoins += joins[i].length;
            return { ...v, ['data']: joins[i] || null };
          });
        })
      );
    });
};

export const getLikedPosts = (afs: AngularFirestore) => {
  return (source) =>
    defer(() => {
      // Operator state
      let likedPosts;

      // Track total num of joined doc reads
      let totalJoins = 0;

      return source.pipe(
        switchMap((data: any) => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          likedPosts = data.likedPosts;

          const reads$ = [];
          for (const item of likedPosts) {
            // Push doc read to Array

            if (item) {
              const itemData = afs
                .collection('posts')
                .doc(item.postId)
                .snapshotChanges()
                .pipe(
                  map((doc) => {
                    const data: any = doc.payload.data();
                    return { id: doc.payload.id, ...data };
                  })
                );

              reads$.push(itemData);
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map((joins) => {
          const newArray = likedPosts.map((v, i) => {
            totalJoins += joins[i].length;
            return { ...v, ['postId']: joins[i] || null };
          });
          return newArray.sort((a, b) => {
            const d1 = new Date(a.dateLiked);
            const d2 = new Date(b.dateLiked);
            return d1 > d2 ? -1 : d2 > d1 ? 1 : 0;
          });
        })
      );
    });
};

export const leftJoin = (
  afs: AngularFirestore,
  field,
  collection,
  limit = 100
) => {
  return (source) =>
    defer(() => {
      // Operator state
      let collectionData;

      // Track total num of joined doc reads
      let totalJoins = 0;

      return source.pipe(
        switchMap((data) => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          collectionData = data as any[];

          const reads$ = [];
          for (const doc of collectionData) {
            // Push doc read to Array

            if (doc[field]) {
              // Perform query on join key, with optional limit
              const q = (ref) =>
                ref.where(field, '==', doc[field]).limit(limit);

              reads$.push(afs.collection(collection, q).valueChanges());
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map((joins) => {
          return collectionData.map((v, i) => {
            totalJoins += joins[i].length;
            return { ...v, [collection]: joins[i] || null };
          });
        })
      );
    });
};

export const leftJoinDocument = (afs: AngularFirestore, field, collection) => {
  return (source) =>
    defer(() => {
      // Operator state
      let collectionData;
      const cache = new Map();

      return source.pipe(
        switchMap((data: any) => {
          cache.clear();
          collectionData = data as any[];
          const reads$ = [];
          let i = 0;
          for (const doc of collectionData) {
            if (
              !doc[field] ||
              cache.get(doc[field] || typeof doc[field] != 'string')
            ) {
              continue;
            }
            reads$.push(
              afs
                .collection(collection)
                .doc(doc[field])
                .snapshotChanges()
                .pipe(
                  map((doc) => {
                    const data: any = doc.payload.data();
                    const id = doc.payload.id;
                    return { id: doc.payload.id, ...data };
                  })
                )
            );
            cache.set(doc[field], i);
            i++;
          }

          return reads$.length ? combineLatest(reads$) : of([]);
        }),
        map((joins: any) => {
          return collectionData.map((v, i) => {
            const joinIdx = cache.get(v[field]);
            return {
              ...v,
              [field]: { ...joins[joinIdx] } || null,
            };
          });
        })
      );
    });
};

export const colletionJoin = (
  afs: AngularFirestore,
  category,
  collection,
  field,
  limit
) => {
  return (source) =>
    defer(() => {
      // Operator state
      let array;

      // Track total num of joined doc reads
      let totalJoins = 0;

      return source.pipe(
        switchMap((select) => {
          // Clear mapping on each emitted val ;

          // Save the parent data state
          array = category as any[];

          const reads$ = [];
          for (const doc of array) {
            // Push doc read to Array

            if (doc) {
              // Perform query on join key, with optional limit
              const q = (ref) =>
                ref
                  .where('genre', '==', select)
                  .where(field, 'array-contains', doc)
                  .orderBy('totalLike', 'desc')
                  .limit(limit);
              const collectionMap = pipe(
                map((docs: QuerySnapshot<any>) => {
                  return docs.docs.map((e) => {
                    return {
                      id: e.id,
                      ...e.data(),
                    } as any;
                  });
                })
              );
              reads$.push(
                afs
                  .collection(collection, q)
                  .snapshotChanges()
                  .pipe(
                    map((actions) => {
                      return actions.map((a) => {
                        const data: any = a.payload.doc.data();
                        const id = a.payload.doc.id;
                        return { id, ...data };
                      });
                    })
                  )
              );
            } else {
              reads$.push(of([]));
            }
          }

          return combineLatest(reads$);
        }),
        map((joins) => {
          return array.map((v, i) => {
            totalJoins += joins[i].length;
            return { ['name']: v, ['photos']: joins[i] || null };
          });
        })
      );
    });
};

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable({
  providedIn: 'root',
})
export class DbService {
  public masterRef;
  constructor(
    @Inject(FIREBASE_REFERENCES.ONE_FIRESTORE) public afs: AngularFirestore,
    @Inject(FIREBASE_REFERENCES.TWO_FIRESTORE)
    private adminFirebase: AngularFirestore
  ) {
    this.masterRef = this.afs.doc(`master/${'1Xod9dBvZkUHJDPSTakjsoR6CCs2'}`);
  }

  createFsId() {
    return this.afs.createId();
  }

  createdAt() {
    return firebase.default.firestore.FieldValue.serverTimestamp();
  }

  admionCollection$(path, query?): Observable<any[]> {
    return this.adminFirebase
      .collection(path, query)
      .snapshotChanges()
      .pipe(
        map((actions: any) => {
          return actions.map((a: any) => {
            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  collection$(path, query?): Observable<any[]> {
    return this.afs
      .collection(path, query)
      .snapshotChanges()
      .pipe(
        map((actions: any) => {
          return actions.map((a: any) => {
            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }
  collectionDebounce$(path, query?): Observable<any[]> {
    return this.afs
      .collection(path, query)
      .snapshotChanges()
      .pipe(
        debounceTime(300),
        map((actions: any) => {
          return actions.map((a: any) => {
            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  collection2$(path, query?) {
    return this.afs.collection(path, query);
  }

  adminDoc$(path): Observable<any> {
    return this.adminFirebase
      .doc(path)
      .snapshotChanges()
      .pipe(
        map((doc) => {
          const data: any = doc.payload.data();
          const id = doc.payload.id;
          return { id: doc.payload.id, ...data };
        })
      );
  }

  doc$(path): Observable<any> {
    return this.afs
      .doc(path)
      .snapshotChanges()
      .pipe(
        map((doc) => {
          const data: any = doc.payload.data();
          const id = doc.payload.id;
          return { id: doc.payload.id, ...data };
        })
      );
  }

  doc2$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref)
      .snapshotChanges()
      .pipe(
        map(
          (
            doc: Action<
              DocumentSnapshotDoesNotExist | DocumentSnapshotExists<T>
            >
          ) => {
            return doc.payload.data() as T;
          }
        )
      );
  }

  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .pipe(
        map((docs: DocumentChangeAction<T>[]) => {
          return docs.map((a: DocumentChangeAction<T>) =>
            a.payload.doc.data()
          ) as T[];
        })
      );
  }

  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }

  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }

  /**
   * @param  {string} path 'collection' or 'collection/docID'
   * @param  {object} data new data
   *
   * Creates or updates data on a collection or document.
   **/

  // ** 기본적인 DB처리 **//
  updateAt(path: string, data: Object): Promise<any> {
    const segments = path.split('/').filter((v) => v);
    if (segments.length % 2) {
      // Odd is always a collection
      return this.afs.collection(path).add(data);
    } else {
      // Even is always document
      return this.afs.doc(path).set(data, { merge: true });
    }
  }

  delete(path) {
    return this.afs.doc(path).delete();
  }

  /**
   * @param  {string} path path to document
   *
   * Deletes document from Firestore
   **/

  deleteDoc(path: string): Promise<any> {
    return this.afs.doc(path).delete();
  }

  acceptOrder(obj) {
    return new Promise((resolve, reject) => {
      this.connectOrder(obj)
        .then((success) => {
          const ref = this.afs.doc(`order/${obj.orderId}`);
          return ref
            .update({
              connectCompanys: firebase.default.firestore.FieldValue.arrayUnion(
                obj.companyId
              ),
            })
            .then((success) => {
              resolve(true);
            })
            .catch((error) => {
              reject(false);
            });
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  acceptagOrder(obj) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`arrangeorder/${obj.orderId}`);
      return ref
        .update({ connectCompany: obj.companyId })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  connectOrder(obj) {
    return new Promise((resolve, reject) => {
      return this.updateAt(`connect`, obj)
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  payVideoOrder(orderId, companyId) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`order/${orderId}`);
      return ref
        .update({
          paidCompanys:
            firebase.default.firestore.FieldValue.arrayUnion(companyId),
        })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  refundOrder(orderId, companyId) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().runTransaction((transaction) => {
        return transaction
          .get(firebase.default.firestore().collection('order').doc(orderId))
          .then((docData) => {
            const refundCompanys = docData.data().refundCompanys || {};
            refundCompanys[companyId] = true;
            return transaction.set(
              firebase.default.firestore().collection('order').doc(orderId),
              { refundCompanys },
              { merge: true }
            );
          })
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(false);
          });
      });
    });
  }

  refundagOrder(orderId, companyId) {
    return new Promise((resolve, reject) => {
      firebase.default.firestore().runTransaction((transaction) => {
        return transaction
          .get(
            firebase.default.firestore().collection('arrangeorder').doc(orderId)
          )
          .then((docData) => {
            const refundCompanys = docData.data().refundCompanys || {};
            refundCompanys[companyId] = true;
            return transaction.set(
              firebase.default
                .firestore()
                .collection('arrangeorder')
                .doc(orderId),
              { refundCompanys },
              { merge: true }
            );
          })
          .then((success) => {
            resolve(true);
          })
          .catch((error) => {
            reject(false);
          });
      });
    });
  }

  checkUsername(nickName: string) {
    nickName = nickName.toLowerCase();
    return this.doc$(`nickNames/${nickName}`);
  }

  appService() {
    const id = 'bfHp2x2Xf9CvpqmZZFvD';
    return this.doc$(`appService/${id}`).pipe(take(1)).toPromise();
  }

  likeInfo(infoId, userId) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`wisdom/${infoId}`);
      return ref
        .update({
          likes: firebase.default.firestore.FieldValue.arrayUnion(userId),
        })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  dislikeInfo(infoId, userId) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`wisdom/${infoId}`);
      return ref
        .update({
          likes: firebase.default.firestore.FieldValue.arrayRemove(userId),
        })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  archiveInfo(infoId, userId) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`wisdom/${infoId}`);
      return ref
        .update({
          archive: firebase.default.firestore.FieldValue.arrayUnion(userId),
        })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  viewInfo(infoId, userId) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`wisdom/${infoId}`);
      return ref
        .update({
          view: firebase.default.firestore.FieldValue.arrayUnion(userId),
        })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  deleteArchive(infoId, userId) {
    return new Promise((resolve, reject) => {
      const ref = this.afs.doc(`wisdom/${infoId}`);
      return ref
        .update({
          archive: firebase.default.firestore.FieldValue.arrayRemove(userId),
        })
        .then((success) => {
          resolve(true);
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  getMaster() {
    return this.collection$(`users`, (ref) => ref.where('isMaster', '==', true))
      .pipe(take(1))
      .toPromise();
  }

  /* 쇼핑몰 프로젝트에서 사용되는 DB Service Method */
  newUpdateAt(path: string, data: Object): Promise<any> {
    const segments = path.split('/').filter((v) => v);
    if (segments.length % 2) {
      return this.afs.collection(path).add(data);
    } else {
      return this.afs.doc(path).set(data);
    }
  }
}

/**
 *  한개의 post안에 userId 아이디를 가지고 있고 userId(글쓴이)의 정보(user document)를 불러와서 엮는 경우
 *  userId(field)가 default값이 되어야합니다.
 * @param afs
 * @param field
 * @param collection
 */
export const categoryDocJoin = (afs: AngularFirestore) => {
  return (source) =>
    defer(() => {
      let parent;
      return source.pipe(
        switchMap((data) => {
          parent = data;

          let reads$ = [];

          for (let index = 0; index < 2; index++) {
            const id = index == 0 ? data['topCategory'] : data['subCategory'];

            let tmp$ = afs
              .doc(`category/${id}`)
              .snapshotChanges()
              .pipe(
                map((doc) => {
                  return doc.payload.data();
                })
              );

            reads$.push(tmp$);
          }

          return reads$.length ? combineLatest(reads$) : of([]);
        }),
        map((fieldData) => {
          delete parent['topCategory'];
          delete parent['subCategory'];
          return {
            topCategory: fieldData[0],
            subCategory: fieldData[1],
            ...parent,
          };
        })
      );
    });
};

/**
 * {uid : 'test21343242', favoriteUsers : ['test2232','test4453543','sdfwe234234']}
 * user 안에 즐겨찾기한 user id를 Array로 가지고 있고 각각의 유저 정보를 찾아와 이를 엮는 경우
 * @param afs
 * @param field
 */

export const ArrayJoin = (
  afs: AngularFirestore,
  field: string,
  collection: string
) => {
  return (source) =>
    defer(() => {
      let docData;
      let arr;
      const cache = new Map();

      return source.pipe(
        switchMap((data) => {
          cache.clear();

          docData = data; // user(object)

          arr = data[field]; // user.favoriteUsers(array)

          const reads$ = [];
          let i = 0;
          if (arr && arr.length > 0) {
            for (const id of arr) {
              reads$.push(afs.collection(collection).doc(id).valueChanges());

              cache.set(id, i);
              i++;
            }
          } else {
            reads$.push(of(null));
          }

          return combineLatest(reads$);
        }),

        map((joins) => {
          return {
            ...docData,
            [field]: arr.map((v) => {
              const joinIdx = cache.get(v); // 고유ID

              return joins[joinIdx] || v;
            }),
          };
        })
      );
    });
};

/**
 * {uid : 'test21343242', favoriteUsers : ['test2232','test4453543','sdfwe234234']}
 * user 안에 즐겨찾기한 user id를 Array로 가지고 있고 각각의 유저 정보를 찾아와 이를 엮는 경우와 같으나 처음에 받아올때 Array!
 * [{uid : 'test21343242', favoriteUsers : ['test2232','test4453543','sdfwe234234']}, {uid : 'test2232', favoriteUsers : ['test21343242','test4453543','sdfwe234234']}]
 * @param afs
 * @param field
 * @param collection
 */
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
