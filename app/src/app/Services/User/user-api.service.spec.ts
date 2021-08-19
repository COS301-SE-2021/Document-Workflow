import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from './../Interfaces/user'

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a user', ()=>{
    let user: User =
      {
        id: 1,
        Fname: 'Brent',
        Lname: 'Stroberg',
        initials: 'BP',
        email: 'u17015741@tuks.co.za',
        phone_number: '0763398714',
        password: process.env.TEST_PASSWORD
      };
    expect( service.getUser(1)).toContain(user);
  });
});
