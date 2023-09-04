import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EventListPage } from './event-list.page';

describe('EventListPage', () => {
  let component: EventListPage;
  let fixture: ComponentFixture<EventListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
