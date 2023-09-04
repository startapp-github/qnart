import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChattingDetailPage } from './chatting-detail.page';

describe('ChattingDetailPage', () => {
  let component: ChattingDetailPage;
  let fixture: ComponentFixture<ChattingDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChattingDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChattingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
