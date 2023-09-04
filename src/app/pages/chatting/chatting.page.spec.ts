import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChattingPage } from './chatting.page';

describe('ChattingPage', () => {
  let component: ChattingPage;
  let fixture: ComponentFixture<ChattingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChattingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChattingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
