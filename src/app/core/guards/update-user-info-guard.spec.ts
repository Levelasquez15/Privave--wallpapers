import { TestBed } from '@angular/core/testing';

import { UpdateUserInfoGuard } from './update-user-info-guard';


describe('UpdateUserInfoGuard', () => {
  let guard: UpdateUserInfoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UpdateUserInfoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
