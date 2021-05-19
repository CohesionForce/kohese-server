import { TestBed } from '@angular/core/testing';

import { RepositoryService } from './repository.service';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';


describe('RepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    declarations: [],
      imports : [],
      schemas: [],
      providers: [
        { provide: RepositoryService, useClass: MockItemRepository }
      ]
  }));

  it('should be created', () => {
    const service: RepositoryService = TestBed.get(RepositoryService);
    expect(service).toBeTruthy();
  });
});
