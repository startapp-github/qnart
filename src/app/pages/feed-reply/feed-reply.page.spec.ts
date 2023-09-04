import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FeedReplyPage } from './feed-reply.page';

describe('FeedReplyPage', () => {
  let component: FeedReplyPage;
  let fixture: ComponentFixture<FeedReplyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedReplyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedReplyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
