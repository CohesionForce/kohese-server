import { TableColumnSelectorComponent } from './table-column-selector/table-column-selector.component';
import { DynamicTypesService } from './../../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from './../../../../classes/UDT/KoheseType.class';
import { TreeConfiguration } from './../../../../../../common/src/tree-configuration';
import { ItemRepository, RepoStates } from './../../../../services/item-repository/item-repository.service';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { DialogService } from './../../../../services/dialog/dialog.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { ProxyTableComponent } from '../../../user-input/k-proxy-selector/proxy-table/proxy-table.component';

@Component({
  selector: 'table-editor',
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.scss']
})
export class TableEditorComponent implements OnInit, OnDestroy {
  @Input()
  formDefinition: any;
  repoStatusSubscription: Subscription;
  treeConfigurationSubscription: Subscription;
  treeConfiguration: TreeConfiguration;
  types: any;

  constructor(private dialogService: DialogService,
              private itemRepository: ItemRepository,
              private changeDetectorRef: ChangeDetectorRef,
              private typeService: DynamicTypesService) { }

  ngOnInit(): void {
    if (!this.formDefinition.tableDef) {
      this.formDefinition.tableDef = {};
    }
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update: any) => {
      switch (update.state) {
        case RepoStates.KOHESEMODELS_SYNCHRONIZED:
        case RepoStates.SYNCHRONIZATION_SUCCEEDED:
          this.treeConfigurationSubscription = this.itemRepository.
            getTreeConfig().subscribe(
            (treeConfiguration: TreeConfiguration) => {
            this.treeConfiguration = treeConfiguration;
            this.types = this.typeService.getKoheseTypes();
            this.changeDetectorRef.markForCheck();
          });
      }
    });
  }

  selectTableKind(kindEvent) {
    if (this.formDefinition.tableDef) {
      this.dialogService.openConfirmDialog('Table Discard', 'Changing table kind will discard your current table definition. Proceed?')
        .subscribe((confirm) => {
          if (confirm) {
            this.formDefinition.tableDef.tableKind = kindEvent.value;
            this.formDefinition.tableDef.columns = ['name', 'kind'];
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
      this.dialogService.openComponentDialog(ProxyTableComponent, {
        data: {}
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
}
