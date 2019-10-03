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
import { MoveDirection, MoveEvent,
  RemoveEvent } from '../k-proxy-selector/proxy-table/proxy-table.component';

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
        if (proxyKind === this.property.propertyName.kind) {
          this.tableData = this.proxy.item[this.property.propertyName.
            attribute];
        } else {
          let upstreamKindReferences: any = this.proxy.relations.referencedBy[
            this.property.propertyName.kind];
          if (upstreamKindReferences) {
            let upstreamKindAttributeReferences: Array<ItemProxy> =
              upstreamKindReferences[this.property.propertyName.attribute];
            if (upstreamKindAttributeReferences) {
              this.tableData = upstreamKindAttributeReferences.map((itemProxy:
                ItemProxy) => {
                return { id: itemProxy.item.id };
              });
            }
          }
        }
        
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
        allowMultiSelect : this.kindInformation.fields[this.property.
          propertyName.attribute].views['form'].inputType.options[
          'allowMultiSelect'],
        proxyContext: this.proxy
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        const selectedIds = selection.map((proxy) => {
          return {id : proxy.item.id};
        });
        this.tableData = selectedIds;
        this.proxy.item[this.property.propertyName.attribute] = selectedIds;
        this.tableDataStream.next(selectedIds);
      }
    });
  }
  
  public move(moveEvent: MoveEvent): void {
    let candidates: Array<string> = moveEvent.candidates;
    let references: Array<any> = this.proxy.item[this.property.propertyName.
      attribute];
    if (moveEvent.moveDirection === MoveDirection.UP) {
      for (let j: number = 0; j < candidates.length; j++) {
        let candidateIndex: number = references.map((reference: any) => {
          return reference.id;
        }).indexOf(candidates[j]);
        let removedReferences: Array<any> = references.splice(candidateIndex,
          1);
        references.splice(candidateIndex - 1, 0, removedReferences[0]);
      }
    } else {
      for (let j: number = (candidates.length - 1); j >= 0; j--) {
        let candidateIndex: number = references.map((reference: any) => {
          return reference.id;
        }).indexOf(candidates[j]);
        let removedReferences: Array<any> = references.splice(candidateIndex,
          1);
        references.splice(candidateIndex + 1, 0, removedReferences[0]);
      }
    }
    
    this.tableData = references;
    this.tableDataStream.next(this.tableData);
  }
  
  public remove(removeEvent: RemoveEvent): void {
    let candidates: Array<string> = removeEvent.candidates;
    let references: Array<any> = this.proxy.item[this.property.propertyName.
      attribute];
    for (let j: number = 0; j < candidates.length; j++) {
      references.splice(references.indexOf(candidates[j]), 1);
    }
    
    this.tableData = references;
    this.tableDataStream.next(this.tableData);
  }
}
