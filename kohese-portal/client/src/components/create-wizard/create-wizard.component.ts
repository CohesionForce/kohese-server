import { Component, OnInit, OnDestroy, Input, Optional, Inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatStepper, MatDialogRef, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';

import { NavigatableComponent } from '../../classes/NavigationComponent.class'
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy.js';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs/Subscription';
import { ImportService } from '../../services/import/import.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

@Component({
  selector : 'create-wizard',
  templateUrl : './create-wizard.component.html',
  styleUrls: ['./create-wizard.component.scss']
})
export class CreateWizardComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  /* Data */
  @Input()
  private itemProxy: ItemProxy;
  models : Array<ItemProxy>;
  types: Array<KoheseType> = [];
  recentProxies : Array<ItemProxy>;
  selectedType : ItemProxy;
  selectedParent : ItemProxy;
  rootProxy : ItemProxy;
  errorMessage : string;

  createFormGroup : FormGroup;
  private nonFormFieldValueMap: any = {};


  /* Subscriptions */
  private repoStatusSubscription: Subscription;


  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
              protected NavigationService : NavigationService,
              private itemRepository: ItemRepository,
              private DynamicTypesService : DynamicTypesService,
              public MatDialogRef : MatDialogRef<CreateWizardComponent>) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update) => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        this.rootProxy = this.itemRepository.getRootProxy();
        let types = this.DynamicTypesService.getKoheseTypes();
        for (let type in types) {
          this.types.push(types[type]);
        }

        this.selectedType = this.types[0];
        this.selectedParent = this.rootProxy;
      }
    });
  }

  onTypeSelected(type, stepper : MatStepper) {
    if (this.selectedType === type) {
      console.log(type);
      stepper.next();
    } else {
      this.selectedType = type;
    }
  }

  onParentSelected(newParent, stepper : MatStepper) {
    console.log(newParent);
    if (this.selectedParent === newParent) {
      stepper.next();
    } else {
      this.selectedParent = newParent;
    }
  }

  onFormGroupUpdated(newFormGroup : any) {
    this.createFormGroup = newFormGroup;
  }

  createItem() {
    let item: any = this.createFormGroup.value;
    for (let fieldName in this.nonFormFieldValueMap) {
      item[fieldName] = this.nonFormFieldValueMap[fieldName];
    }
    
    /* Set the value of each field that has an unspecified value to that
    field's default value */
    let fields: object = this.itemRepository.getProxyFor(this.selectedType.
      name).item.properties;
    for (let fieldName in fields) {
      if (null === item[fieldName]) {
        item[fieldName] = fields[fieldName].default;
      }
    }
    
    this.itemRepository.buildItem(this.selectedType.name, item)
      .then(()=>{
        console.log('Build Item promise resolve')
        this.MatDialogRef.close();
      }, (error)=> {
        // TODO show error on review stepper 
        this.errorMessage = error;
        console.log('*** Failed to upsert: ' + this.selectedType.name);
        console.log(error);
      });
      
  }

  ngOnDestroy(): void {
    this.repoStatusSubscription.unsubscribe();
  }
  
  public whenNonFormFieldChanges(updatedField: any): void {
    this.nonFormFieldValueMap[updatedField.fieldName] = updatedField.fieldValue;
  }
}

