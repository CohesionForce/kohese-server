import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { AttributeEditorComponent } from '../attribute-editor/attribute-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'property-editor',
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyEditorComponent implements OnInit, OnDestroy {
  private _koheseTypeStream: Observable<KoheseType>;
  @Input('koheseTypeStream')
  set koheseTypeStream(koheseTypeStream: Observable<KoheseType>) {
    this._koheseTypeStream = koheseTypeStream;
  }

  private _koheseType: KoheseType;
  get koheseType() {
    return this._koheseType;
  }

  private _koheseTypeStreamSubscription: Subscription;

  constructor(private dialogService: DialogService,
    private _dynamicTypesService: DynamicTypesService,
    private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this._koheseTypeStreamSubscription = this._koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this._koheseType = koheseType;
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy(): void {
    this._koheseTypeStreamSubscription.unsubscribe();
  }

  add(): void {
    this.dialogService.openInputDialog('Add Property', '', DialogComponent.
      INPUT_TYPES.TEXT, 'Name', '', undefined).afterClosed().subscribe((name:
      string) => {
      if (name) {
        this._koheseType.addProperty(name);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public delete(propertyId: string): void {
    let attributeUsages: Array<any> = this.getAttributeUsages(propertyId);
    if (attributeUsages.length > 0) {
      let message: string = 'The following Items prevent removal of ' +
        propertyId + ':\n';
      for (let j: number = 0; j < attributeUsages.length; j++) {
        message += '\n\t- ';
        message += attributeUsages[j].name;
      }
      this.dialogService.openInformationDialog(propertyId + ' Removal ' +
        'Prevented', message);
    } else {
      this.dialogService.openYesNoDialog('Delete ' + propertyId,
        'Are you sure that you want to delete ' + propertyId + '?').
        subscribe((choiceValue: any) => {
        if (choiceValue) {
          this._koheseType.deleteProperty(propertyId);
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }
  
  private getAttributeUsages(attributeName: string): Array<any> {
    let attributeUsages: Array<any> = [];
    let koheseType: KoheseType;
    let localType: any;
    let koheseTypes: Array<KoheseType> = Object.values(this.
      _dynamicTypesService.getKoheseTypes());
    for (let j: number = 0; j < koheseTypes.length; j++) {
      if (koheseTypes[j] === this._koheseType) {
        koheseType = koheseTypes[j];
        break;
      }
    }
    
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(undefined,
      (itemProxy: ItemProxy) => {
      if (itemProxy.kind === koheseType.dataModelProxy.item.name) {
        if (Array.isArray(koheseType.dataModelProxy.item.properties[
          attributeName].type)) {
          // The first check below should not be necessary.
          if (itemProxy.item[attributeName] && itemProxy.item[attributeName].
            length > 0) {
            attributeUsages.push(itemProxy.item);
          }
        } else {
          if (itemProxy.item[attributeName] != null) {
            attributeUsages.push(itemProxy.item);
          }
        }
      }
    });
    
    return attributeUsages;
  }

  public async openAttributeEditor(attributeName: string): Promise<void> {
    let attributeUsages: Array<any> = this.getAttributeUsages(attributeName);
    if (attributeUsages.length > 0) {
      await this.dialogService.openInformationDialog('Data Invalidation',
        'Due to usage of this attribute, modifying this attribute may ' +
        'invalidate data.').toPromise();
    }
    
    this.dialogService.openComponentDialog(AttributeEditorComponent, {
      data: {
        attributeName: attributeName,
        attribute: this._koheseType.dataModelProxy.item.properties[
          attributeName],
        type: this._koheseType.dataModelProxy.item,
        view: this._koheseType.viewModelProxy.item.viewProperties[
          attributeName]
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((returnedObject:
      any) => {
      this._changeDetectorRef.markForCheck();
    });
  }
}
