import { KoheseType } from './../../../classes/UDT/KoheseType.class';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DynamicTypesService } from './../../../services/dynamic-types/dynamic-types.service';
import { ItemProxy } from './../../../../../common/src/item-proxy';
import { Component, OnInit, Input } from '@angular/core';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { TreeConfiguration } from './../../../../../common/src/tree-configuration';

@Component({
  selector: 'k-table',
  templateUrl: './k-table.component.html',
  styleUrls: ['./k-table.component.scss']
})
export class KTableComponent implements OnInit, OnDestroy {
  @Input ()
  property;
  @Input ()
  editable = false;
  @Input ()
  proxy: ItemProxy;

  treeConfig: TreeConfiguration;
  treeConfigSub: Subscription;

  kindInformation: KoheseType;
  tableDefinition;
  tableKind: string;
  tableData;

  constructor(private typeService: DynamicTypesService,
              private itemRepository: ItemRepository) { }

  ngOnInit() {
    this.treeConfigSub = this.itemRepository.getTreeConfig()
    .subscribe((newConfig) => {
      if (newConfig) {
        this.treeConfig = newConfig.config;
        const types = this.typeService.getKoheseTypes();
        const proxyKind = this.proxy.model.item.name;
        this.kindInformation = types[proxyKind];
        this.tableDefinition = this.kindInformation.fields[this.property.propertyName].views.form.tableDef;
        this.tableKind = this.kindInformation.fields[this.property.propertyName].views.form.tableKind;
        this.tableData = this.proxy.item[this.property.propertyName];
        if (this.tableData) {
          console.log(this);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.treeConfigSub) {
      this.treeConfigSub.unsubscribe();
    }
  }

}
