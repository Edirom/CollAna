import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EHinmanComponent } from './e-hinman.component';

describe('EHinmanComponent', () => {
  let component: EHinmanComponent;
  let fixture: ComponentFixture<EHinmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EHinmanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EHinmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});