import { DialogService } from './../../services/dialog/dialog.service';
import { Subscription } from 'rxjs';
import { ItemRepository, RepoStates } from './../../services/item-repository/item-repository.service';
import { DynamicTypesService } from './../../services/dynamic-types/dynamic-types.service';
import { ItemProxy } from './../../../../common/src/item-proxy';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { select } from 'd3';

@Component({
  selector: 'report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss'],
  changeDetection : ChangeDetectionStrategy.OnPush
})

// Save reports as a type

export class ReportGeneratorComponent implements OnInit {
  typeInfo = {};
  reportDefs : Array<ReportDefinition> = [];
  selectedReport : ReportDefinition;
  selectedType;
  selectedTypeFormat;
  repoLoaded : boolean = false;

  repositoryStatusSubscription : Subscription;
  treeConfigSubscription : Subscription;

  constructor(private typeService : DynamicTypesService,
              private itemRepository : ItemRepository,
              private changeRef : ChangeDetectorRef,
              private dialogService : DialogService) {

  }

  ngOnInit() {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
          this.treeConfigSubscription =
            this.itemRepository.getTreeConfig().subscribe((newConfig) => {
              this.typeInfo = this.typeService.getKoheseTypes();
              this.repoLoaded = true;
              this.changeRef.markForCheck();
            })
        }
      });
  }

  addReport() {
    let typeFormats = {};

    for (let type in this.typeInfo) {
      let properties : { [key : string] : PropertyFormat} = {};

      for (let field in this.typeInfo[type].fields) {
        properties[field] = {
          active : false,
          name : field
        }
      }

      typeFormats[type] = {
        type : type,
        properties : properties,
        active : false,
        orderedProperties : []
      };
      }

    this.itemRepository.buildItem('ReportDefinition', {
      name : 'New Report',
      entryPoints : [],
      typeFormats : typeFormats,
    }).then((newReport) => {
      this.reportDefs.push({
        name : newReport.item.name,
        entryPoints : newReport.item.entryPoints,
        typeFormats : newReport.item.typeFormats,
        dirty : false,
        proxy : newReport
      })
    })



    this.changeRef.markForCheck();
  }

  toggleType(reportDef : ReportDefinition, typeInfo : any) {
    let typeName = typeInfo.dataModelProxy.item.name;
    let typeFormat = reportDef.typeFormats[typeName];

    if(!typeFormat) {
      reportDef.typeFormats[typeInfo.dataModelProxy.item.name] = {
        type : typeInfo.dataModelProxy.item.name,
        properties : {},
        active : true,
        orderedProperties : []
      };
    } else if (typeFormat.active) {
      typeFormat.active = false;
    } else {
      typeFormat.active = true;
    }
    this.selectedReport.dirty = true;
    this.changeRef.markForCheck();
  }

  toggleProperty(type : string, property: string) {
    let typeFormat = this.selectedReport.typeFormats[type];
    let propertyFormat = typeFormat.properties[property];
    if (propertyFormat.active) {
      let index = typeFormat.orderedProperties.indexOf(property);
      typeFormat.orderedProperties.splice(index, 1);
      propertyFormat.active = false;
    } else {
      typeFormat.orderedProperties.push(property);
      propertyFormat.active = true;
    }
    console.log(this.selectedType);
    this.selectedReport.dirty = true;
    this.changeRef.markForCheck();
  }

  enableAllTypes(selectedReport : ReportDefinition){
    for (let type in this.typeInfo) {
      if (!selectedReport.typeFormats[type].active) {
        selectedReport.typeFormats[type].active = true;
      }
    }
    this.selectedReport.dirty = true;
    this.changeRef.markForCheck();
  }

  disableAllTypes(selectedReport : ReportDefinition) {
    for(let type in selectedReport.typeFormats) {
      selectedReport.typeFormats[type].active = false;

    }
    this.selectedReport.dirty = true;
    this.changeRef.markForCheck();
  }

  enableAllProperties() {
    for (let property in this.selectedTypeFormat.properties) {
      if (!this.selectedTypeFormat.properties[property].active) {
      this.selectedTypeFormat.properties[property].active = true;
      this.selectedTypeFormat.orderedProperties.push(property);
      }
    }
    console.log(this.selectedType);
    this.selectedReport.dirty = true;
    this.changeRef.markForCheck();
  }

  disableAllProperties() {
    for (let property in this.selectedTypeFormat.properties) {
      this.selectedTypeFormat.properties[property].active = false;
    }
    this.selectedTypeFormat.orderedProperties = [];
    this.selectedReport.dirty = true;
    this.changeRef.markForCheck();
  }

  openPreview() {
    this.dialogService.openConfirmDialog('Under Construction', 'Preview not yet implemented');
  }

  swapPosition(orderedProperties : Array<string> , direction : string, value : string) {
      let startingIndex = orderedProperties.indexOf(value);
      let toIndex = (direction === "up") ? startingIndex - 1 : startingIndex + 1;

      orderedProperties.splice(toIndex, 0, orderedProperties.splice(startingIndex, 1)[0]);
      this.changeRef.markForCheck();
  }

  saveReport() {
    this.selectedReport.proxy.item.name = this.selectedReport.name;
    this.selectedReport.proxy.item.entryPoints = this.selectedReport.entryPoints;
    this.selectedReport.proxy.item.typeFormats = this.selectedReport.typeFormats;
    this.itemRepository.upsertItem(this.selectedReport.proxy).then((newProxy)=>{
      this.selectedReport.dirty = false;
      this.changeRef.markForCheck();
    });
  }

}


export interface ReportDefinition {
  name : string
  entryPoints : Array<ItemProxy>;
  typeFormats : { [type: string] : TypeFormat };
  proxy : ItemProxy;
  dirty : boolean;
}

interface TypeFormat {
  active : boolean;
  type : string;
  properties : { [property : string] : PropertyFormat}
  orderedProperties : Array<string>
}

interface PropertyFormat {
  active : boolean;
  name : string
}
