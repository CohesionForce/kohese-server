import { FormatPreviewComponent } from './format-preview/format-preview.component';
import { DialogService } from './../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import * as uuidV1 from 'uuid/v1';

export interface FormatDefinition {
  name : string
  header : FormatContainer
  containers : Array<FormatContainer>
  id : string
}

 export interface FormatContainer {
  kind : string,
  contents : Array<PropertyDefinition>
}

export interface PropertyDefinition {
  propertyName : string
  hideLabel : boolean
  customLabel? : string
  labelOrientation: string
  kind : string
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
  modelUndefined : boolean = false;

  formatDefs : Array<FormatDefinition>;

  constructor(private typeService : DynamicTypesService,
     private changeRef : ChangeDetectorRef,
     private itemRepository : ItemRepository,
     private dialogService : DialogService) {

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
      if (!koheseType.viewModelProxy) {
        this.modelUndefined = true;
        this.changeRef.markForCheck();
        return;
      }
      this.modelUndefined = false;
      if (!koheseType.viewModelProxy.item.formatDefinitions) {
        koheseType.viewModelProxy.item.formatDefinitions = {};
        koheseType.viewModelProxy.item.defaultFormatKey = undefined;
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
    let id = uuidV1();
    this.formatDefs[id] = ({
      name : 'New definition ',
      header : {
        kind : 'header',
        contents : [{
          propertyName : 'name',
          hideLabel : true,
          labelOrientation : 'Top',
          kind : 'text'
        }]
      },
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
    this.dialogService.openComponentDialog(FormatPreviewComponent, {
      data : {
        format : this.selectedFormat
      }
    });
  }

  setDefault (id) {
    this.currentType.viewModelProxy.item.defaultFormatKey = id;
    this.changeRef.markForCheck();
  }

  deleteFormat (id) {
    delete this.formatDefs[id];
    if(this.currentType.viewModelProxy.item.defaultFormatKey === id) {
      delete this.currentType.viewModelProxy.item.defaultFormatKey;
      for (let formatId in this.formatDefs) {
        this.currentType.viewModelProxy.item.defaultFormatKey = formatId;
        break;
      }
    }
    this.changeRef.markForCheck();
    if (id === this.selectedFormat.id) {
      this.selectedFormat = undefined;
    }
  }



}
