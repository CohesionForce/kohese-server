import { Component, OnInit, OnDestroy, Input, Optional, Inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatTableDataSource, MatStepper, MatDialogRef } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/models/item-proxy.js';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { ImportService } from '../../services/import/import.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';

@Component({
  selector : 'create-wizard',
  templateUrl : './create-wizard.component.html'
})
export class CreateWizardComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  /* Data */
  @Input()
  private itemProxy: ItemProxy;
  models : Array<ItemProxy>;
  types: Array<ItemProxy> = [];
  recentProxies : Array<ItemProxy>;
  selectedType : ItemProxy;
  selectedParent : ItemProxy;

  createFormGroup : FormGroup;

  /* Observables */
  typeStream : MatTableDataSource<ItemProxy>;

  /* Subscriptions */
  private repoStatusSubscription: Subscription;


  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
              protected NavigationService : NavigationService,
              private itemRepository: ItemRepository,
              private ImportService : ImportService,
              private DynamicTypesService : DynamicTypesService,
              public dialogReference : MatDialogRef<CreateWizardComponent>) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update) => {
      if (update.connected) {
        this.models = this.itemRepository.getProxyFor('Model-Definitions').
          getDescendants().sort((first: ItemProxy, second: ItemProxy) => {
          return ((first.item.name > second.item.name) ?
            1 : ((first.item.name < second.item.name) ? -1 : 0));
        });
        for (let i = 0; i < this.models.length; i++) {
          let modelView = this.DynamicTypesService.getViewProxyFor(this.models[i]);
          if (modelView) {
            this.types.push(this.models[i]);
          }
        }
        this.typeStream = new MatTableDataSource<ItemProxy>(this.types);
        this.recentProxies = this.itemRepository.getRecentProxies();
        this.selectedParent = 'ROOT'
        console.log(this.types);
        console.log(this.recentProxies);
      }
    });
  }

  onTypeSelected(type, stepper : MatStepper) {
    if (this.selectedType === type) {
      stepper.next();
    } else {
      this.selectedType = type;
    }
  }

  onFormGroupUpdated(newFormGroup : any) {
    this.createFormGroup = newFormGroup;
    console.log(newFormGroup);
  }

  createItem() {
    this.itemRepository.createItem(this.selectedType.item.name, this.createFormGroup.value)
      .then(()=>{
        console.log('Create Item promise resolve')
        this.dialogReference.close();
      });
  }

  ngOnDestroy(): void {
    this.repoStatusSubscription.unsubscribe();
  }

  importFiles (fileInput) {
    this.ImportService.importFile(fileInput, 'ROOT');
  }
}

