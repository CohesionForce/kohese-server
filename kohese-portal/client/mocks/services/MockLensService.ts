import { ApplicationLens } from '../../src/services/lens-service/lens.service'
import { BehaviorSubject, Observable } from 'rxjs';

export class MockLensService {
  lensSubject: BehaviorSubject<ApplicationLens> = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT)
  
  constructor() {

  }

  setLens(newLens: ApplicationLens) {
    this.lensSubject.next(newLens);
  }

  getLensSubject(): Observable<ApplicationLens> {
    return this.lensSubject;
  }

  resetService () : void {
    this.lensSubject = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT);
  }
}