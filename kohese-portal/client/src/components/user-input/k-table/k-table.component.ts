import { BehaviorSubject } from 'rxjs';
import { DialogService } from './../../../services/dialog/dialog.service';
import { ProxySelectorDialogComponent } from './../k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
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
  // Provide either a tableDefinition or a property
  @Input ()
  property;
  @Input ()
  tableDefinition;
  @Input ()
  editable = false;
  @Input ()
  proxy: ItemProxy;

  treeConfig: TreeConfiguration;
  treeConfigSub: Subscription;

  kindInformation: KoheseType;
  tableKind: string;
  tableData;
  tableDataStream: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor(private typeService: DynamicTypesService,
              private itemRepository: ItemRepository,
              private dialogService: DialogService) { }

  ngOnInit() {
    this.treeConfigSub = this.itemRepository.getTreeConfig()
    .subscribe((newConfig) => {
      if (newConfig) {
        this.treeConfig = newConfig.config;
        const types = this.typeService.getKoheseTypes();
        const proxyKind = this.proxy.model.item.name;
        this.kindInformation = types[proxyKind];
        if (!this.tableDefinition) {
          this.tableDefinition = this.kindInformation.fields[this.property.propertyName].views.form.tableDef;
          this.tableKind = this.kindInformation.fields[this.property.propertyName].views.form.tableKind;
        }
        this.tableData = this.proxy.item[this.property.propertyName];
        if (!this.tableData) {
          this.tableData = [];
          console.log('no table data');
        }
        this.tableDataStream.next(this.tableData);
      }
    });
  }

  ngOnDestroy() {
    if (this.treeConfigSub) {
      this.treeConfigSub.unsubscribe();
    }
  }

  public openProxySelectionDialog(): void {
    const selectedProxies = [];
    for (const idx in this.tableData) {
      if (idx) {
        const proxy = this.treeConfig.getProxyFor(this.tableData[idx].id);
        if (proxy) {
          selectedProxies.push(proxy);
        }
      }
    }
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        selected: selectedProxies,
        allowMultiSelect : this.kindInformation.fields[this.property.propertyName].views['form'].inputType.options['allowMultiSelect'],
        proxyContext: this.proxy
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        const selectedIds = selection.map((proxy) => {
          return {id : proxy.item.id};
        });
        this.tableData = selectedIds;
        this.proxy.item[this.property.propertyName] = selectedIds;
        this.tableDataStream.next(selectedIds);
      }
    });
  }

}
