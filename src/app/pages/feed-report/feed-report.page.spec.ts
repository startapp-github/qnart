import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FeedReportPage } from './feed-report.page';

describe('FeedReportPage', () => {
  let component: FeedReportPage;
  let fixture: ComponentFixture<FeedReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
