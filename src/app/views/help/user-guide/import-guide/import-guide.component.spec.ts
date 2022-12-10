import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportGuideComponent } from './import-guide.component';

describe('ImportGuideComponent', () => {
  let component: ImportGuideComponent;
  let fixture: ComponentFixture<ImportGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportGuideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
