import { Component, OnInit, OnDestroy, Input, Optional, Inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { ImportService } from '../../services/import/import.service';

@Component({
  selector : 'create-wizard',
  templateUrl : './create-wizard.component.html'
})
export class CreateWizardComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  @Input()
  private itemProxy: ItemProxy;
  private repoStatusSubscription: Subscription;
  types: Array<ItemProxy>;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
              protected NavigationService : NavigationService,
              private itemRepository: ItemRepository,
              private ImportService : ImportService) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update) => {
      if (update.connected) {
        this.types = this.itemRepository.getProxyFor('Model-Definitions').
          getDescendants().sort((first: ItemProxy, second: ItemProxy) => {
          return ((first.item.name > second.item.name) ?
            1 : ((first.item.name < second.item.name) ? -1 : 0));
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.repoStatusSubscription.unsubscribe();
  }

  importFiles (fileInput) {
    this.ImportService.importFile(fileInput, 'ROOT');
  }
}

