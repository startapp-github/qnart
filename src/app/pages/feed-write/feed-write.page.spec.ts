import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FeedWritePage } from './feed-write.page';

describe('FeedWritePage', () => {
  let component: FeedWritePage;
  let fixture: ComponentFixture<FeedWritePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedWritePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedWritePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
