import { Subscription } from 'rxjs';
import { ItemRepository, RepoStates } from './../../services/item-repository/item-repository.service';
import { DynamicTypesService } from './../../services/dynamic-types/dynamic-types.service';
import { ItemProxy } from './../../../../common/src/item-proxy';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

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
    this.reportDefs.push({
      reportName : 'New report',
      entryPoints : [],
      typeFormats : new Map<string, TypeFormat>()
    })
    this.changeRef.markForCheck();
  }

  toggleType(reportDef : ReportDefinition, typeInfo : any) {
    let typeName = typeInfo.dataModelProxy.item.name;

    if (reportDef.typeFormats.get(typeName)) {
      reportDef.typeFormats.delete(typeInfo.dataModelProxy.item.name)
    } else {
      reportDef.typeFormats.set(typeInfo.dataModelProxy.item.name,{
        type : typeInfo.dataModelProxy.item.name,
        includedFields : []
      })
    }
    this.changeRef.markForCheck();
  }
}

export interface ReportDefinition {
  reportName : string
  entryPoints : Array<ItemProxy>;
  typeFormats : Map<string, TypeFormat>;

}

interface TypeFormat {
  type : string;
  includedFields : Array<string>;
}
