import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input } from '@angular/core';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { FormatDefinition,
  FormatDefinitionType } from '../../type-editor/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

enum Ordering {
  ELDEST_FIRST_WHEN_OBSERVED = 'Eldest First When Observed',
    ELDEST_LAST_WHEN_OBSERVED = 'Eldest Last When Observed',
    ELDEST_FIRST_JOURNAL_ENTRY_MADE = 'Eldest First Journal Entry Made',
    ELDEST_LAST_JOURNAL_ENTRY_MADE = 'Eldest Last Journal Entry Made',
    OBSERVER = 'Observer', JOURNAL_ENTRY_MAKER = 'Journal Entry Maker',
    ISSUES_FIRST = 'Issues First', ISSUES_LAST = 'Issues Last'
}

@Component({
  selector: 'journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JournalComponent {
  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }
  @Input('itemProxy')
  set itemProxy(itemProxy: ItemProxy) {
    this._itemProxy = itemProxy;
    
    
  }
  
  private _selectedParentId: string = '';
  get selectedParentId() {
    return this._selectedParentId;
  }
  set selectedParentId(selectedParentId: string) {
    this._selectedParentId = selectedParentId;
  }
  
  private _additionalContextIds: Array<string> = [];
  get additionalContextIds() {
    return this._additionalContextIds;
  }
  
  private _selectedOrdering: Ordering = Ordering.ELDEST_FIRST_WHEN_OBSERVED;
  get selectedOrdering() {
    return this._selectedOrdering;
  }
  set selectedOrdering(selectedOrdering: Ordering) {
    this._selectedOrdering = selectedOrdering;
  }
  
  private _filterTimeoutIdentifier: any;
  
  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }
  
  get Ordering() {
    return Ordering;
  }
  
  get FormatDefinitionType() {
    return FormatDefinitionType;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }
  
  get Object() {
    return Object;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository, private _dialogService:
    DialogService, private _navigationService: NavigationService) {
  }
  
  public addEntry(): void {
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        type: TreeConfiguration.getWorkingTree().getProxyFor('Observation').
          item,
        object: {
          parentId: this._itemProxy.item.id
        },
        formatDefinitionType: FormatDefinitionType.DEFAULT,
        allowKindChange: true
      }
    }).updateSize('90%', '90%').afterClosed().subscribe(async (result:
      any) => {
      if (result) {
        await this._itemRepository.upsertItem(result.type.name, result.object);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public filterChanged(filter: string): void {
    if (this._filterTimeoutIdentifier) {
      clearTimeout(this._filterTimeoutIdentifier);
    }
    
    this._filterTimeoutIdentifier = setTimeout(() => {
      this._changeDetectorRef.reattach();
      this._changeDetectorRef.markForCheck();
      this._filterTimeoutIdentifier = undefined;
    }, 700);
    
    this._changeDetectorRef.detach();
  }
  
  public getObservations(filter: string): Array<ItemProxy> {
    let observationItemProxys: Array<ItemProxy> = [];
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(
      { includeOrigin: false }, (itemProxy: ItemProxy) => {
      let contextEntry: any = itemProxy.model.item.classProperties['context'];
      if (contextEntry && (contextEntry.definedInKind === 'Observation')){
        // Migration code
        if (!Array.isArray(itemProxy.item.context)) {
          itemProxy.item.context = (itemProxy.item.context ? [itemProxy.item.
            context] : []);
        }
        
        if (itemProxy.item.context.map((reference: any) => {
          // Migration code
          if (reference.id) {
            return reference.id;
          } else {
            return reference;
          }
        }).indexOf(this._itemProxy.item.id) !== -1) {
          observationItemProxys.push(itemProxy);
        }
      }
    }, undefined);
    
    return observationItemProxys.filter((observationItemProxy: ItemProxy) => {
      return (observationItemProxy.item.name.toLowerCase().indexOf(filter.
        toLowerCase()) !== -1);
    }).sort((oneObservationItemProxy: ItemProxy, anotherObservationItemProxy:
      ItemProxy) => {
      switch (this._selectedOrdering) {
        case Ordering.ELDEST_FIRST_WHEN_OBSERVED:
          return (oneObservationItemProxy.item.observedOn -
            anotherObservationItemProxy.item.observedOn);
        case Ordering.ELDEST_LAST_WHEN_OBSERVED:
          return (anotherObservationItemProxy.item.observedOn -
            oneObservationItemProxy.item.observedOn);
        case Ordering.ELDEST_FIRST_JOURNAL_ENTRY_MADE:
          return oneObservationItemProxy.item.createdOn -
            anotherObservationItemProxy.item.createdOn;
        case Ordering.ELDEST_LAST_JOURNAL_ENTRY_MADE:
          return anotherObservationItemProxy.item.createdOn -
            oneObservationItemProxy.item.createdOn;
        case Ordering.OBSERVER:
          return oneObservationItemProxy.item.observedBy.localeCompare(
            anotherObservationItemProxy.item.observedBy);
        case Ordering.JOURNAL_ENTRY_MAKER:
          return oneObservationItemProxy.item.createdBy.localeCompare(
            anotherObservationItemProxy.item.createdBy);
        case Ordering.ISSUES_FIRST:
          return oneObservationItemProxy.kind.localeCompare(
            anotherObservationItemProxy.kind);
        case Ordering.ISSUES_LAST:
          return anotherObservationItemProxy.kind.localeCompare(
            oneObservationItemProxy.kind);
      }
    });
  }
  
  public getViewModel(typeName: string): any {
    return TreeConfiguration.getWorkingTree().getProxyFor('view-' + typeName.
      toLowerCase()).item;
  }
  
  public save(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item).then(
      (returnedItemProxy: ItemProxy) => {
      this._changeDetectorRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }
  
  public discardChanges(itemProxy: ItemProxy): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(itemProxy.item.id));
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
    this._changeDetectorRef.markForCheck();
  }
  
  public navigate(itemProxy: ItemProxy): void {
    this._navigationService.addTab('Explore', { id: itemProxy.item.id });
  }
}
