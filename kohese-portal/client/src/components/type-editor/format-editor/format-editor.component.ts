import { ItemRepository } from './../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

export interface FormatDefinition {
  name : string,
  containers : Array<FormatContainer>,
  id : string
}

 export interface FormatContainer {
  kind : string,
  contents : Array<PropertyDefinition>
}

export interface PropertyDefinition {
  propertyName : string,
  hideLabel : boolean
  // Will grow as we get to the property part
}

@Component({
  selector: 'format-editor',
  templateUrl: './format-editor.component.html',
  styleUrls: ['./format-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatEditorComponent implements OnInit, OnDestroy {

  @Input()
  koheseTypeStream: Observable<KoheseType>;
  koheseTypeStreamSubscription : Subscription;
  currentType: KoheseType;
  idProperties: any = {};
  selectedPropertyId: string;
  selectedFormat : FormatDefinition
  types = [];

  formatDefs : Array<FormatDefinition>;

  constructor(private typeService : DynamicTypesService, private changeRef : ChangeDetectorRef, private itemRepository : ItemRepository) {

  }

  ngOnInit(): void {
    let koheseTypes: any = this.typeService.getKoheseTypes();
    for (let type in koheseTypes) {
      this.types[type] = type;
      for (let propertyName in koheseTypes[type].dataModelProxy.item.properties) {
        if (koheseTypes[type].dataModelProxy.item.properties[propertyName].id) {
          if (!this.idProperties[type]) {
            this.idProperties[type] = [];
          }

          this.idProperties[type].push(propertyName);
        }
      }
    }
    this.koheseTypeStreamSubscription = this.koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this.currentType = koheseType;
      if (!koheseType.viewModelProxy.item.formatDefinitions) {
        koheseType.viewModelProxy.item.formatDefinitions = {};
        koheseType.viewModelProxy.item.defaultFormatIndex = undefined;
      }
      this.formatDefs = koheseType.viewModelProxy.item.formatDefinitions;

      this.changeRef.markForCheck();
      console.log(this.currentType);
    });
  }

  ngOnDestroy(): void {
    this.koheseTypeStreamSubscription.unsubscribe();
  }

  addDefinition () {
    let id = this.createUUID();
    this.formatDefs[id] = ({
      name : 'New definition ' + this.formatDefs.length,
      containers : [],
      id : id
    })
    if (!this.currentType.viewModelProxy.item.defaultFormatKey) {
      this.currentType.viewModelProxy.item.defaultFormatKey = id;
    }
  }

  saveFormat () {
    console.log(this.currentType.viewModelProxy);
    this.itemRepository.upsertItem(this.currentType.viewModelProxy).then((result) => { console.log(result)});
  }

  openPreview () {
    console.log ('Open Preview');
  }

  deleteFormat () {

  }

  createUUID() : string {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

}
