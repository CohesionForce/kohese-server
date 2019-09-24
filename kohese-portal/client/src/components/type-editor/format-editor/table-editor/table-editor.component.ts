import { TreeConfiguration } from './../../../../../../common/src/tree-configuration';
import { ItemRepository, RepoStates } from './../../../../services/item-repository/item-repository.service';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { DialogService } from './../../../../services/dialog/dialog.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { ProxyTableComponent } from '../../../user-input/k-proxy-selector/proxy-table/proxy-table.component';
import { TablePreviewDialogComponent } from './table-preview-dialog/table-preview-dialog.component';

@Component({
  selector: 'table-editor',
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.scss']
})
export class TableEditorComponent implements OnInit, OnDestroy {
  private _tableDefinition: any;
  get tableDefinition() {
    return this._tableDefinition;
  }
  @Input('tableDefinition')
  set tableDefinition(tableDefinition: any) {
    this._tableDefinition = tableDefinition;
  }
  
  @Input()
  propertyId: string;
  
  private _attributes: Array<any>;
  get attributes() {
    return this._attributes;
  }
  @Input('attributes')
  set attributes(attributes: Array<any>) {
    this._attributes = attributes;
  }
  
  repoStatusSubscription: Subscription;
  treeConfigurationSubscription: Subscription;
  treeConfiguration: TreeConfiguration;
  
  get Object() {
    return Object;
  }

  constructor(private dialogService: DialogService,
              private itemRepository: ItemRepository,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update: any) => {
      switch (update.state) {
        case RepoStates.KOHESEMODELS_SYNCHRONIZED:
        case RepoStates.SYNCHRONIZATION_SUCCEEDED:
          this.treeConfigurationSubscription = this.itemRepository.
            getTreeConfig().subscribe(
            (configObj: any) => {
            this.treeConfiguration = configObj.config;
            this.changeDetectorRef.markForCheck();
          });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.treeConfigurationSubscription) {
      this.treeConfigurationSubscription.unsubscribe();
    }
    this.repoStatusSubscription.unsubscribe();
  }

  openTablePreview() {
      this.dialogService.openComponentDialog(TablePreviewDialogComponent, {
        data: {
          tableDef : this._tableDefinition,
          property : {
            propertyName: this.propertyId
          }
        }
      }).updateSize('60%', '60%').afterClosed().subscribe((selected: any) => {
    });
    }

  deleteColumn(deletedColumn) {
    for (let idx = 0; idx < this._tableDefinition.columns.length; idx++) {
      const column = this._tableDefinition.columns[idx];
      if (column === deletedColumn) {
        this._tableDefinition.columns.splice(idx, 1);
      }
    }
  }

  addColumn() {
    let attributeNames: Array<string> = this._attributes.map((attribute:
      any) => {
      return attribute.name;
    }).filter((attributeName: string) => {
      return (this._tableDefinition.columns.indexOf(attributeName) === -1);
    });
    this.dialogService.openSelectDialog('Add Column', '', 'Attribute',
      attributeNames[0], attributeNames).afterClosed().subscribe(
      (newColumn) => {
        if (newColumn) {
          this._tableDefinition.columns.push(newColumn);
          this.changeDetectorRef.markForCheck();
        }
      });
  }
  
  public moveAttribute(attributeName: string, moveUp: boolean): void {
    let attributeIndex: number = this._tableDefinition.columns.indexOf(
      attributeName);
    this._tableDefinition.columns.splice(attributeIndex, 1);
    this._tableDefinition.columns.splice(attributeIndex + (moveUp ? -1 : 1), 0,
      attributeName);
    this.changeDetectorRef.markForCheck();
  }

  addExpandedProperty(colNum: number) {
    let attributeNames: Array<string> = this._attributes.map((attribute:
      any) => {
      return attribute.name;
    });
    this.dialogService.openSelectDialog('Add Column', '', 'Attribute',
      attributeNames[0], attributeNames).afterClosed().subscribe((newProp) => {
        if (newProp) {
          const columnName = 'column' + colNum;
          this._tableDefinition.expandedFormat[columnName].push(newProp);
          console.log(this);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  removeExpandedProperty(property, colNum) {
    const column = 'column' + colNum;
    const columnContents = this._tableDefinition.expandedFormat[column];
    for (let i = 0; i < columnContents.length; i++) {
      if (columnContents[i] === property) {
        columnContents.splice(i, 1);
      }
    }
  }
}
