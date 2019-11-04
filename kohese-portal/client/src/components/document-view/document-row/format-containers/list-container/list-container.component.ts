import { Input } from '@angular/core';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';

import { DialogService } from '../../../../../services/dialog/dialog.service';
import { PropertyDefinition } from '../../../../type-editor/PropertyDefinition.interface';
import { KTableComponent } from '../../../../user-input/k-table/k-table.component';
import { ProxySelectorDialogComponent } from '../../../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
import { ItemProxy } from '../../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';

@Component({
  selector: 'list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListContainerComponent implements OnInit {
  @Input()
  editable: boolean = false;
  @Input()
  contents: Array<PropertyDefinition>;
  @Input()
  proxy;
  
  @ViewChild('kTable')
  private _table: KTableComponent;

  constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) { }

  ngOnInit() {
  }

  stateChanged(stateName, value) {
    this.proxy.item[stateName] = value;
    this._changeDetectorRef.markForCheck();
  }
  
  public openProxySelectionDialog(propertyDefinition: PropertyDefinition):
    void {
    const selectedProxies = [];
    for (const idx in this.proxy.item[propertyDefinition.propertyName.
      attribute]) {
      if (idx) {
        const proxy = TreeConfiguration.getWorkingTree().getProxyFor(this.
          proxy.item[propertyDefinition.propertyName.attribute][idx].id);
        if (proxy) {
          selectedProxies.push(proxy);
        }
      }
    }
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        selected: selectedProxies,
        allowMultiSelect: true,
        proxyContext: this.proxy
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        const selectedIds = selection.map((proxy) => {
          return {id : proxy.item.id};
        });
        this.proxy.item[propertyDefinition.propertyName.attribute] =
          selectedIds;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public getTableDefinition(propertyDefinition: PropertyDefinition): any {
    return TreeConfiguration.getWorkingTree().getProxyFor('view-' +
      TreeConfiguration.getWorkingTree().getProxyFor(propertyDefinition.
      propertyName.kind).item.classProperties[propertyDefinition.propertyName.
      attribute].definition.type[0].toLowerCase()).item.tableDefinitions[
      propertyDefinition['tableDefinition']];
  }
  
  public getRows(propertyDefinition: PropertyDefinition): Array<any> {
    const proxyKind = this.proxy.model.item.name;
    if (proxyKind === propertyDefinition.propertyName.kind) {
      return this.proxy.item[propertyDefinition.propertyName.attribute];
    } else {
      let upstreamKindReferences: any = this.proxy.relations.referencedBy[
        propertyDefinition.propertyName.kind];
      if (upstreamKindReferences) {
        let upstreamKindAttributeReferences: Array<ItemProxy> =
          upstreamKindReferences[propertyDefinition.propertyName.attribute];
        if (upstreamKindAttributeReferences) {
          return upstreamKindAttributeReferences.map((itemProxy:
            ItemProxy) => {
            return { id: itemProxy.item.id };
          });
        }
      }
      
      return [];
    }
  }
  
  public mayMoveSelection(moveUp: boolean, propertyDefinition:
    PropertyDefinition): boolean {
    let selection: Array<any> = this._table.selection;
    for (let j: number = 0; j < selection.length; j++) {
      if (moveUp) {
        if (this.proxy.item[propertyDefinition.propertyName.attribute].map(
          (reference: any) => {
          return reference.id;
        }).indexOf(selection[j].item.id) === 0) {
          return false;
        }
      } else {
        if (this.proxy.item[propertyDefinition.propertyName.attribute].map(
          (reference: any) => {
          return reference.id;
        }).indexOf(selection[j].item.id) === (this.proxy.item[
          propertyDefinition.propertyName.attribute].length - 1)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  public move(moveUp: boolean, propertyDefinition: PropertyDefinition):
    void {
    let candidates: Array<any> = this._table.selection;
    let references: Array<any> = this.proxy.item[propertyDefinition.
      propertyName.attribute];
    if (moveUp) {
      for (let j: number = 0; j < candidates.length; j++) {
        let candidateIndex: number = references.map((reference: any) => {
          return reference.id;
        }).indexOf(candidates[j].item.id);
        let removedReferences: Array<any> = references.splice(candidateIndex,
          1);
        references.splice(candidateIndex - 1, 0, removedReferences[0]);
      }
    } else {
      for (let j: number = (candidates.length - 1); j >= 0; j--) {
        let candidateIndex: number = references.map((reference: any) => {
          return reference.id;
        }).indexOf(candidates[j].item.id);
        let removedReferences: Array<any> = references.splice(candidateIndex,
          1);
        references.splice(candidateIndex + 1, 0, removedReferences[0]);
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public remove(propertyDefinition: PropertyDefinition): void {
    let candidates: Array<any> = this._table.selection;
    let references: Array<any> = this.proxy.item[propertyDefinition.propertyName.
      attribute];
    for (let j: number = 0; j < candidates.length; j++) {
      references.splice(references.map((reference: any) => {
        return reference.id;
      }).indexOf(candidates[j].item.id), 1);
    }
    
    this._changeDetectorRef.markForCheck();
  }
}

