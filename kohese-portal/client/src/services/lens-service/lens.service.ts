import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs';
import { ItemRepository } from '../item-repository/item-repository.service';

@Injectable()
export class LensService {
  lensSubject: BehaviorSubject<ApplicationLens> = new BehaviorSubject<ApplicationLens>(ApplicationLens.DEFAULT)
  constructor(private itemRepository: ItemRepository) {

  }

  setLens(newLens: ApplicationLens) {
    if (newLens === ApplicationLens.DEFAULT) {
      this.itemRepository.setTreeConfig('Unstaged');
    }
    this.lensSubject.next(newLens);
  }

  getLensSubject(): Observable<ApplicationLens> {
    return this.lensSubject;
  }
}

export enum ApplicationLens {
  DEFAULT,
  HISTORY,
  BRANCH,
  SPHERE,

}

