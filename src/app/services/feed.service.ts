/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { take, map } from 'rxjs/operators';
import 'firebase/auth';
import {
  AngularFirestoreCollection,
  DocumentReference,
  QueryDocumentSnapshot,
} from '@angular/fire/compat/firestore';
import { Post } from 'src/app/models/post.model';
import { UserService } from './user.service';
import { DbService, getComments, leftJoinDocument } from './db.service';
import { User } from 'src/app/models/user.models';

export interface Item {
  id: string;
  ref: DocumentReference;
  data: Post;
  comments: any;
  createdBy: User;
}

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private itemsSubject: BehaviorSubject<Item[] | undefined> =
    new BehaviorSubject(undefined);
  private lastPageReached: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );
  private loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  filter: string;
  intestedCategory = [];
  private nextQueryAfter: QueryDocumentSnapshot<Post>;
  private paginationSub: Subscription;
  private findSub: Subscription;
  constructor(public db: DbService, private userService: UserService) {}

  init(filter) {
    this.loading.next(false);

    this.filter = this.getFilterName(filter);
    this.intestedCategory = this.userService.userData.intestedCategory;

    console.log(this.intestedCategory);

    try {
      const collection: AngularFirestoreCollection<Post> =
        this.db.afs.collection<Post>('/posts/', (ref) =>
          ref
            .where('categoryId', 'in', this.intestedCategory)
            .where('isDisplay', '==', true)
            .orderBy(this.filter, 'desc')
            .limit(15)
        );

      this.unsubscribe();
      this.paginationSub = collection.get().subscribe(async (first) => {
        // this.itemsSubject.next([]);
        this.lastPageReached.next(false);
        this.nextQueryAfter = first.docs[
          first.docs.length - 1
        ] as QueryDocumentSnapshot<Post>;
        await this.query(collection);
      });
    } catch (err) {
      console.log('err');

      throw err;
    }
  }

  reinIt(filter?) {
    this.loading.next(false);
    if (filter) {
      this.filter = this.getFilterName(filter);
    }

    this.intestedCategory = this.userService.userData.intestedCategory;
    console.log(this.intestedCategory);

    try {
      let collection: AngularFirestoreCollection<Post>;

      if (!this.intestedCategory) {
        collection = this.db.afs.collection<Post>('/posts/', (ref) =>
          ref
            .where('isDisplay', '==', true)
            .orderBy(this.filter, 'desc')
            .limit(15)
        );
      } else {
        collection = this.db.afs.collection<Post>('/posts/', (ref) =>
          ref
            .where('categoryId', 'in', this.intestedCategory)
            .where('isDisplay', '==', true)
            .orderBy(this.filter, 'desc')
            .limit(15)
        );
      }

      this.unsubscribe();
      this.paginationSub = collection.get().subscribe(async (first) => {
        this.itemsSubject.next([]);
        this.lastPageReached.next(false);
        this.nextQueryAfter = first.docs[
          first.docs.length - 1
        ] as QueryDocumentSnapshot<Post>;
        await this.query(collection);
      });
    } catch (err) {
      throw err;
    }
  }

  getFilterName(filter) {
    switch (filter) {
      case '최신순':
        return 'dateCreated';
      case '추천순':
        return 'recommendPoint';
      case '조회수순':
        return 'checkUserNumber';
      default:
        break;
    }
  }

  destroy() {
    this.unsubscribe();
  }

  private unsubscribe() {
    if (this.paginationSub) {
      this.paginationSub.unsubscribe();
    }

    if (this.findSub) {
      this.findSub.unsubscribe();
    }
  }

  watchItems(): Observable<Item[]> {
    return this.itemsSubject.asObservable();
  }

  watchLastPageReached(): Observable<boolean> {
    return this.lastPageReached.asObservable();
  }

  watchLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  find() {
    try {
      const collection: AngularFirestoreCollection<Post> =
        this.getCollectionQuery();

      this.unsubscribe();

      this.paginationSub = collection.get().subscribe(async (first) => {
        if (!first.docs.length) {
          this.lastPageReached.next(true);
          return;
        }
        this.nextQueryAfter = first.docs[
          first.docs.length - 1
        ] as QueryDocumentSnapshot<Post>;
        await this.query(collection);
      });
    } catch (err) {
      throw err;
    }
  }

  private getCollectionQuery(): AngularFirestoreCollection<Post> {
    if (this.nextQueryAfter) {
      return this.db.afs.collection<Post>('/posts/', (ref) =>
        ref
          .where('categoryId', 'in', this.intestedCategory)
          .where('isDisplay', '==', true)
          .orderBy(this.filter, 'desc')
          .startAfter(this.nextQueryAfter)
          .limit(10)
      );
    } else {
      return this.db.afs.collection<Post>('/posts/', (ref) =>
        ref
          .where('categoryId', 'in', this.intestedCategory)
          .where('isDisplay', '==', true)
          .orderBy(this.filter, 'desc')
          .limit(10)
      );
    }
  }

  private query(collection: AngularFirestoreCollection<Post>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.findSub = collection
          .snapshotChanges()
          .pipe(
            map((actions) => {
              return actions.map((a) => {
                const data: Post = a.payload.doc.data() as Post;
                const id = a.payload.doc.id;
                const createdBy = data.createdBy;
                const ref = a.payload.doc.ref;
                return {
                  id,
                  createdBy,
                  ref,
                  data,
                };
              });
            }),
            leftJoinDocument(this.db.afs, 'createdBy', 'users'),
            getComments(this.db.afs)
          )
          .subscribe(async (items: Item[]) => {
            await this.addItems(items);
            resolve();
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  private addItems(items: Item[]): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!items || items.length <= 0) {
        this.lastPageReached.next(true);
        resolve();
        return;
      }
      this.itemsSubject
        .asObservable()
        .pipe(take(1))
        .subscribe((currentItems: Item[]) => {
          this.itemsSubject.next(
            currentItems !== undefined
              ? [
                  ...currentItems,
                  ...items.filter(
                    (c) =>
                      !currentItems.find((item) => item.id == c.id) &&
                      !this.userService.userData.blockedUsers?.find(
                        (item) => item == c.createdBy.id
                      )
                  ),
                ]
              : [...items]
          );
          console.log('addItems');
          this.loading.next(true);
          resolve();
        });
    });
  }

  updateFeed(post) {
    this.itemsSubject
      .asObservable()
      .pipe(take(1))
      .subscribe((currentItems: Item[]) => {
        let findIndex = currentItems?.findIndex((item) => item.id == post.id);
        currentItems[findIndex] = post;
        this.itemsSubject.next([...currentItems]);
      });
  }

  removeFeed(post) {
    this.itemsSubject
      .asObservable()
      .pipe(take(1))
      .subscribe((currentItems: Item[]) => {
        let findIndex = currentItems?.findIndex((item) => item.id == post.id);
        currentItems.splice(findIndex, 1);
        this.itemsSubject.next([...currentItems]);
      });
  }

  addFeed(post) {
    this.itemsSubject
      .asObservable()
      .pipe(take(1))
      .subscribe((currentItems: Item[]) => {
        this.itemsSubject.next([post, ...currentItems]);
      });
  }
}
