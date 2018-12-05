import { TableColumnSelectorComponent } from './table-column-selector/table-column-selector.component';
import { DynamicTypesService } from './../../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from './../../../../classes/UDT/KoheseType.class';
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
  @Input()
  formDefinition: any;
  @Input()
  currentKind: KoheseType;
  @Input()
  propertyId: string;
  repoStatusSubscription: Subscription;
  treeConfigurationSubscription: Subscription;
  treeConfiguration: TreeConfiguration;
  types: any;

  constructor(private dialogService: DialogService,
              private itemRepository: ItemRepository,
              private changeDetectorRef: ChangeDetectorRef,
              private typeService: DynamicTypesService) { }

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
            this.types = this.typeService.getKoheseTypes();
            this.changeDetectorRef.markForCheck();
          });
          if (!this.formDefinition.tableDef) {
            this.formDefinition.tableDef = {};
            this.formDefinition.tableKind = 'Action';
            this.formDefinition.columns = ['name', 'createdBy'];
            this.changeDetectorRef.markForCheck();
            console.log('No table definition found');
          }
      }
    });
  }

  selectTableKind(kindEvent) {
    if (this.formDefinition.tableDef) {
      this.dialogService.openConfirmDialog('Table Discard', 'Changing table kind will discard your current table definition. Proceed?')
        .subscribe((confirm) => {
          if (confirm) {
            this.formDefinition.tableDef.tableKind = kindEvent.value;
            this.formDefinition.tableDef.columns = ['name', 'createdBy'];
          }
          this.changeDetectorRef.markForCheck();
          });
    }
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
          tableDef : this.formDefinition.tableDef,
          property : {
            propertyName: this.propertyId
          }
        }
      }).updateSize('60%', '60%').afterClosed().subscribe((selected: any) => {
    });
    }

  deleteColumn(deletedColumn) {
    for (let idx = 0; idx < this.formDefinition.tableDef.columns.length; idx++) {
      const column = this.formDefinition.tableDef.columns[idx];
      if (column === deletedColumn) {
        this.formDefinition.tableDef.columns.splice(idx, 1);
      }
    }
  }

  addColumn() {
    this.dialogService.openComponentDialog(TableColumnSelectorComponent, {
      data : {
        fields : this.types[this.formDefinition.tableDef.tableKind].fields
      }
    }).updateSize('20%', '20%')
      .afterClosed()
      .subscribe((newColumn) => {
        if (newColumn) {
          this.formDefinition.tableDef.columns.push(newColumn);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  saveTableFormat() {
    this.currentKind.updateProperty(this.propertyId, this.currentKind.fields[this.propertyId]);
    console.log(this);
  }

  addExpandedProperty(colNum: number) {
    this.dialogService.openComponentDialog(TableColumnSelectorComponent, {
      data : {
        fields : this.types[this.formDefinition.tableDef.tableKind].fields
      }
    }).updateSize('20%', '20%')
      .afterClosed()
      .subscribe((newProp) => {
        if (newProp) {
          const columnName = 'column' + colNum;
          this.formDefinition.tableDef.expandedFormat[columnName].push(newProp);
          console.log(this);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onExpandedChecked(change) {
    if (change.checked) {
      this.formDefinition.tableDef.expandedFormat = {
        column1 : [],
        column2 : [],
        column3 : [],
        column4 : []
      };
    }
  }

  removeExpandedProperty(property, colNum) {
    const column = 'column' + colNum;
    const columnContents = this.formDefinition.tableDef.expandedFormat[column];
    for (let i = 0; i < columnContents.length; i++) {
      if (columnContents[i] === property) {
        columnContents.splice(i, 1);
      }
    }
  }
}
