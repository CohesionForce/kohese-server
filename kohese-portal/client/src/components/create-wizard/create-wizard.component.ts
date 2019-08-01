import { Component, OnInit, Input, Optional, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatStepper, MatDialogRef, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';


import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'create-wizard',
  templateUrl: './create-wizard.component.html',
  styleUrls: ['./create-wizard.component.scss']
})
export class CreateWizardComponent extends NavigatableComponent
  implements OnInit {
  /* Data */
  private _parentId: string;
  @Input('parentId')
  set parentId(parentId: string) {
    this._parentId = parentId;
  }
  
// tslint:disable-next-line: no-inferrable-types
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  errorMessage: any;
  private _proxyPlaceholderStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get proxyPlaceholderStream() {
    return this._proxyPlaceholderStream;
  }
  createFormGroup: FormGroup;
  private nonFormFieldValueMap: any = {};

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    protected NavigationService: NavigationService,
    private itemRepository: ItemRepository,
    public MatDialogRef: MatDialogRef<CreateWizardComponent>) {
    super(NavigationService);
  }

  ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._parentId = this.data['parentId'];
    }
    
    this._proxyPlaceholderStream.next(this.buildProxyPlaceholder());
  }
  
  public isDialogInstance(): boolean {
    return this.MatDialogRef && (this.MatDialogRef.componentInstance ===
      this) && this.data;
  }
  
  private buildProxyPlaceholder(): any {
    let modelProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'Item');
    let proxyPlaceholder: any = {
      kind: 'Item',
      item: {
        parentId: this._parentId
      },
      model: modelProxy
    };

    for (let fieldName in modelProxy.item.classProperties) {
      if (proxyPlaceholder.item[fieldName] == null) {
        proxyPlaceholder.item[fieldName] = TreeConfiguration.getWorkingTree().
          getProxyFor(modelProxy.item.classProperties[fieldName].
          definedInKind).item.properties[fieldName].default;
      }
    }

    return proxyPlaceholder;
  }

  onFormGroupUpdated(newFormGroup: any) {
    this.createFormGroup = newFormGroup;
  }

  createItem() {
    let item: any = this.createFormGroup.value;
    this._isDisabled = true;
    for (let fieldName in this.nonFormFieldValueMap) {
      item[fieldName] = this.nonFormFieldValueMap[fieldName];
    }

    /* Set the value of each field that has an unspecified value to that
    field's default value */
    let modelProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      this.proxyPlaceholderStream.getValue().kind);
    let fields: object = modelProxy.item.classProperties;
    for (let fieldName in fields) {
      if (null === item[fieldName]) {
        item[fieldName] = TreeConfiguration.getWorkingTree().getProxyFor(
          modelProxy.item.classProperties[fieldName].definedInKind).item.
          properties[fieldName].default;
      }
    }

    this.itemRepository.upsertItem(this.proxyPlaceholderStream.getValue().kind,
      item).then(() => {
        console.log('Build Item promise resolve');
        this.MatDialogRef.close();
      }, (error) => {
        // TODO show error on review stepper
        this.errorMessage = error;
        console.log(error);
      });

  }

  cancel() {
    this.MatDialogRef.close();
  }

  public clearError(): void {
    this.errorMessage = undefined;
    this._isDisabled = false;
  }

  public whenNonFormFieldChanges(updatedField: any): void {
    this.nonFormFieldValueMap[updatedField.fieldName] = updatedField.fieldValue;
  }
}

