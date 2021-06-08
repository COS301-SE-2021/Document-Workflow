import { TestBed } from '@angular/core/testing';

import { DocumentAPIService } from './document-api.service';

describe('DocumentAPIService', () => {
  let service: DocumentAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
