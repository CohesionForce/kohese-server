import { Component, OnInit, OnDestroy, Input, Optional, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatStepper, MatDialogRef, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';


import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy.js';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Subscription ,  BehaviorSubject } from 'rxjs';
import { ImportService } from '../../services/import/import.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

@Component({
  selector: 'create-wizard',
  templateUrl: './create-wizard.component.html',
  styleUrls: ['./create-wizard.component.scss']
})
export class CreateWizardComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  /* Data */
  @Input()
  private itemProxy: ItemProxy;
  isDisabled = false;
  models: Array<ItemProxy>;
  types: Array<KoheseType> = [];
  recentProxies: Array<ItemProxy>;
  selectedType: KoheseType;
  selectedParent: ItemProxy;
  rootProxy: ItemProxy;
  errorMessage: string;
  treeConfig;
  private _proxyPlaceholderStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get proxyPlaceholderStream() {
    return this._proxyPlaceholderStream;
  }
  createFormGroup: FormGroup;
  private nonFormFieldValueMap: any = {};


  /* Subscriptions */
  private treeConfigSub: Subscription;


  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    protected NavigationService: NavigationService,
    private itemRepository: ItemRepository,
    private DynamicTypesService: DynamicTypesService,
    public MatDialogRef: MatDialogRef<CreateWizardComponent>) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.treeConfigSub = this.itemRepository.getTreeConfig()
      .subscribe((newConfig) => {
        if (newConfig) {
          this.treeConfig = newConfig.config;
          this.rootProxy = this.treeConfig.getRootProxy();
          let types = this.DynamicTypesService.getKoheseTypes();
          for (let type in types) {
            this.types.push(types[type]);
          }

          this.selectedType = this.types[0];
          this.selectedParent = this.rootProxy;
          this._proxyPlaceholderStream.next(this.buildProxyPlaceholder());
        }
      });
  }

  onTypeSelected(type, stepper: MatStepper) {
    if (this.selectedType === type) {
      console.log(type);
      stepper.next();
    } else {
      this.selectedType = type;
      this._proxyPlaceholderStream.next(this.buildProxyPlaceholder());
    }
  }

  onParentSelected(newParent : any, stepper: MatStepper) {
    if (this.selectedParent === newParent) {
      stepper.next();
    } else {
      this.selectedParent = newParent;
      this._proxyPlaceholderStream.next(this.buildProxyPlaceholder());
    }
  }

  private buildProxyPlaceholder(): any {
    let proxyPlaceholder: any = {
      kind: this.selectedType.dataModelProxy.item.name,
      item: {
        parentId: this.selectedParent.item.id
      },
      model: this.selectedType.dataModelProxy
    };

    for (let fieldName in this.selectedType.fields) {
      if (!proxyPlaceholder.item[fieldName]) {
        proxyPlaceholder.item[fieldName] = this.selectedType.fields[fieldName].
          default;
      }
    }

    return proxyPlaceholder;
  }

  onFormGroupUpdated(newFormGroup: any) {
    this.createFormGroup = newFormGroup;
  }

  createItem() {
    let item: any = this.createFormGroup.value;
    this.isDisabled = true;
    for (let fieldName in this.nonFormFieldValueMap) {
      item[fieldName] = this.nonFormFieldValueMap[fieldName];
    }

    /* Set the value of each field that has an unspecified value to that
    field's default value */
    let fields: object = this.treeConfig.getProxyFor(this.selectedType.
      dataModelProxy.item.name).item.properties;
    for (let fieldName in fields) {
      if (null === item[fieldName]) {
        item[fieldName] = fields[fieldName].default;
      }
    }

    this.itemRepository.buildItem(this.selectedType.dataModelProxy.item.name,
      item).then(() => {
        console.log('Build Item promise resolve');
        this.MatDialogRef.close();
      }, (error) => {
        // TODO show error on review stepper
        this.errorMessage = error;
        console.log('*** Failed to upsert: ' + this.selectedType.
          dataModelProxy.item.name);
        console.log(error);
      });

  }

  ngOnDestroy(): void {
    this.treeConfigSub.unsubscribe();
  }

  cancel() {
    this.MatDialogRef.close();
  }

  public whenNonFormFieldChanges(updatedField: any): void {
    this.nonFormFieldValueMap[updatedField.fieldName] = updatedField.fieldValue;
  }
}

