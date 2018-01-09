import { Input, Component, OnInit, OnDestroy } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { ItemProxy } from '../../../../../common/models/item-proxy'

import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  selector: 'type-editor',
  templateUrl : './type-editor.component.html'
})

export class TypeEditorComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* UI Switches */
  repoConnected : boolean;
  /* Data */
  selectedType : ItemProxy;

  /* Observables */
  @Input()
  selectedTypeSubject : BehaviorSubject<ItemProxy>;

  /* Subscriptions */
  selectedTypeSubscription : Subscription;
  repoSubscription : Subscription;

  constructor(NavigationService : NavigationService,
              TabService : TabService,
              private ItemRepository : ItemRepository) {
    super(NavigationService, TabService);

  }

  ngOnInit () {
    this.repoSubscription = this.ItemRepository.getRepoStatusSubject().subscribe((update) => {
      if (update.connected) {
        this.repoConnected = true;
      }
    })
    this.selectedTypeSubject.subscribe((type) => {
      this.selectedType = type;
    })
  }

  ngOnDestroy () {
    this.repoSubscription.unsubscribe();
    this.selectedTypeSubscription.unsubscribe();
  }

}
