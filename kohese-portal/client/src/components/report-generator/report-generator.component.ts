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

  repositoryStatusSubscription : Subscription;
  treeConfigSubscription : Subscription;

  constructor(private typeService : DynamicTypesService, private itemRepository : ItemRepository, private  changeRef : ChangeDetectorRef) {

  }

  ngOnInit() {
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === status.state) {
          this.treeConfigSubscription =
            this.itemRepository.getTreeConfig().subscribe((newConfig) => {
              this.typeInfo = this.typeService.getKoheseTypes();
              console.log(this.typeInfo);
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
        active : false
      };
      }

    this.reportDefs.push({
      reportName : 'New report',
      entryPoints : [],
      typeFormats : typeFormats
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
        active : true
      };
    } else if (typeFormat.active) {
      typeFormat.active = false;
    } else {
      typeFormat.active = true;
    }
    this.changeRef.markForCheck();
  }

  toggleProperty(property) {
    property.active = !property.active
    this.changeRef.markForCheck();
  }

  console(obj){
    console.log(obj);
  }

  enableAllTypes(selectedReport : ReportDefinition){
    for (let type in this.typeInfo) {
      selectedReport.typeFormats[type].active = true
    }
    this.changeRef.markForCheck();
  }

  disableAllTypes(selectedReport : ReportDefinition) {
    for(let type in selectedReport.typeFormats) {
      selectedReport.typeFormats[type].active = false;
    }
    this.changeRef.markForCheck();
  }

  enableAllProperties(selectedType : TypeFormat) {
    for (let property in selectedType.properties) {
      selectedType.properties[property].active = true;
    }
    this.changeRef.markForCheck();
  }

  disableAllProperties(selectedType : TypeFormat) {
    for (let property in selectedType.properties) {
      selectedType.properties[property].active = false;
    }
    this.changeRef.markForCheck();
  }
}

export interface ReportDefinition {
  reportName : string
  entryPoints : Array<ItemProxy>;
  typeFormats : { [type: string] : TypeFormat };

}

interface TypeFormat {
  active : boolean;
  type : string;
  properties : { [property : string] : PropertyFormat}
}

interface PropertyFormat {
  active : boolean;
  name : string
}
