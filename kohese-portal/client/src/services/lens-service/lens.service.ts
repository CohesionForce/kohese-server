import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LensService {
  lensSubject : BehaviorSubject<ApplicationLens> = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT)
  constructor() {

  }

  setLens (newLens : ApplicationLens) {
    
    this.lensSubject.next(newLens);
  }

  getLensSubject() : Observable<ApplicationLens> {
    return this.lensSubject;
  }
}

export enum ApplicationLens {
  DEFAULT,
  HISTORY,
  BRANCH,
  SPHERE,

}

