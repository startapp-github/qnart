import { InjectionToken, NgModule, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ENV, ENV_CONFIG } from '../env';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ɵAngularFireSchedulers } from '@angular/fire';

export function AngularFirestoreFactory(
  platformId: any,
  zone: NgZone,
  env: ENV,
  projectId: string
) {
  const schedulers = new ɵAngularFireSchedulers(zone);

  return new AngularFirestore(
    env.firebaseConfig[projectId],
    projectId,
    false,
    null,
    platformId,
    zone,
    schedulers,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );
}

export function AngularFireAuthFactory(
  platformId: any,
  zone: NgZone,
  env: ENV,
  projectId: string
) {
  const schedulers = new ɵAngularFireSchedulers(zone);

  return new AngularFireAuth(
    env.firebaseConfig[projectId],
    projectId,
    platformId,
    zone,
    schedulers,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );
}

export const FIREBASE_PROJECT_ONE = new InjectionToken(
  'firebase project injector'
);
export const FIREBASE_PROJECT_TWO = new InjectionToken(
  'firebase project injector'
);

export const FIREBASE_REFERENCES = {
  ONE_FIRESTORE: 'project-one-firestore',
  TWO_FIRESTORE: 'project-two-firestore',
  ONE_FIREAUTH: 'project-one-fireauth',
  TWO_FIREAUTH: 'project-two-fireauth',
};

@NgModule({
  declarations: [],
  providers: [
    { provide: FIREBASE_PROJECT_ONE, useValue: 'PROJECT-ONE' },
    { provide: FIREBASE_PROJECT_TWO, useValue: 'PROJECT-TWO' },
    {
      provide: FIREBASE_REFERENCES.ONE_FIRESTORE,
      deps: [PLATFORM_ID, NgZone, ENV_CONFIG, FIREBASE_PROJECT_ONE],
      useFactory: AngularFirestoreFactory,
    },
    {
      provide: FIREBASE_REFERENCES.TWO_FIRESTORE,
      deps: [PLATFORM_ID, NgZone, ENV_CONFIG, FIREBASE_PROJECT_TWO],
      useFactory: AngularFirestoreFactory,
    },
    {
      provide: FIREBASE_REFERENCES.ONE_FIREAUTH,
      deps: [PLATFORM_ID, NgZone, ENV_CONFIG, FIREBASE_PROJECT_ONE],
      useFactory: AngularFireAuthFactory,
    },
    {
      provide: FIREBASE_REFERENCES.TWO_FIREAUTH,
      deps: [PLATFORM_ID, NgZone, ENV_CONFIG, FIREBASE_PROJECT_TWO],
      useFactory: AngularFireAuthFactory,
    },
  ],
  imports: [CommonModule],
})
export class FirebaseModule {}
