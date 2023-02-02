import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRouteBoxComponent } from './edit-route-box.component';

describe('EditRouteBoxComponent', () => {
  let component: EditRouteBoxComponent;
  let fixture: ComponentFixture<EditRouteBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRouteBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRouteBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
