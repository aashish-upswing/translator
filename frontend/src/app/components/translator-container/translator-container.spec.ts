import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatorContainer } from './translator-container';

describe('TranslatorContainer', () => {
  let component: TranslatorContainer;
  let fixture: ComponentFixture<TranslatorContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslatorContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslatorContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
