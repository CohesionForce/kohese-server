import { Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { ItemProxy } from '../../../../common/models/item-proxy';

import { NavigationService } from '../../services/navigation/navigation.service';
import { TabService } from '../../services/tab/tab.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  selector: 'type-creator',
  templateUrl : './type-creator.component.html'
})

export class TypeCreatorComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* UI Switches */

  /* Data */
  modelProxy : ItemProxy;
  typeList : Array<ItemProxy>;
  selectedType : ItemProxy;

  /* Observables */
  selectedTypeSubject : BehaviorSubject<ItemProxy>;

  /* Subscriptions */

  constructor(NavigationService : NavigationService,
              TabService : TabService,
              private ItemRepository : ItemRepository) {
    super(NavigationService, TabService);

  }

  ngOnInit () {
    this.ItemRepository.getRepoStatusSubject().subscribe((update) => {
      if (update.connected) {
        this.modelProxy = this.ItemRepository.getProxyFor('Model-Definitions');
        this.typeList = this.modelProxy.getDescendants();
        console.log(this.typeList);
      }
    })
    this.selectedTypeSubject = new BehaviorSubject(undefined);
  }

  ngOnDestroy () {

  }

  selectType(type : ItemProxy) {
    this.selectedType = type;
    this.selectedTypeSubject.next(this.selectedType);
    console.log(this);
  }
}
