import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrackingModalPage } from './tracking-modal.page';

describe('TrackingModalPage', () => {
  let component: TrackingModalPage;
  let fixture: ComponentFixture<TrackingModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackingModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
