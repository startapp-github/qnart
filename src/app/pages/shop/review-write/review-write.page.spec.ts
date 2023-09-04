import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReviewWritePage } from './review-write.page';

describe('ReviewWritePage', () => {
  let component: ReviewWritePage;
  let fixture: ComponentFixture<ReviewWritePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewWritePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewWritePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
