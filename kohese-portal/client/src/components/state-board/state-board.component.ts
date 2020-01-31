import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input } from '@angular/core';

import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DetailsDialogComponent } from '../details/details-dialog/details-dialog.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';

@Component({
  selector: 'state-board',
  templateUrl: './state-board.component.html',
  styleUrls: ['./state-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StateBoardComponent {
  private _project: any;
  get project() {
    return this._project;
  }
  @Input('project')
  set project(project: any) {
    this._project = project;
    this.selectedKind = this.getBoardKinds()[0];
  }
  
  private _selectedKind: any;
  get selectedKind() {
    return this._selectedKind;
  }
  set selectedKind(selectedKind: any) {
    this._selectedKind = selectedKind;
    this._viewModel = TreeConfiguration.getWorkingTree().getProxyFor('view-' +
      this._selectedKind.name.toLowerCase()).item;
    
    this._changeDetectorRef.markForCheck();
  }
  
  private _viewModel: any;
  get viewModel() {
    return this._viewModel;
  }
  
  get Object() {
    return Object;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: NavigationService, private _itemRepository:
    ItemRepository, private _dialogService: DialogService) {
  }
  
  public getBoardKinds(): Array<any> {
    let kinds: Array<any> = [];
    for (let j: number = 0; j < this._project.projectItems.length; j++) {
      TreeConfiguration.getWorkingTree().getProxyFor(this._project.
        projectItems[j].id).visitTree({ includeOrigin: true }, (itemProxy:
        ItemProxy) => {
        let kind: any = itemProxy.model.item;
        if (kinds.indexOf(kind) === -1) {
          for (let attributeName in kind.properties) {
            if (kind.properties[attributeName].type === 'StateMachine') {
              kinds.push(kind);
              break;
            }
          }
        }
      }, undefined);
    }
    
    kinds.sort((oneKind: any, anotherKind: any) => {
      return oneKind.name.localeCompare(anotherKind.name);
    });
    
    return kinds;
  }
  
  public save(): void {
    this._itemRepository.upsertItem('Project', this._project);
  }
  
  public getStates(): Array<any> {
    for (let attributeName in this._selectedKind.properties) {
      if (this._selectedKind.properties[attributeName].type ===
        'StateMachine') {
        return Object.keys(this._selectedKind.properties[attributeName].
          properties.state);
      }
    }
    
    return [];
  }
  
  public getStateItems(stateName: string): Array<any> {
    let items: Array<any> = [];
    let stateAttributeName: string;
    for (let attributeName in this._selectedKind.properties) {
      if (this._selectedKind.properties[attributeName].type ===
        'StateMachine') {
        stateAttributeName = attributeName;
        break;
      }
    }
    
    for (let j: number = 0; j < this._project.projectItems.length; j++) {
      TreeConfiguration.getWorkingTree().getProxyFor(this._project.
        projectItems[j].id).visitTree({ includeOrigin: true }, (itemProxy:
        ItemProxy) => {
        if ((itemProxy.model.item === this._selectedKind) && (itemProxy.item[
          stateAttributeName] === stateName)) {
          items.push(itemProxy.item);
        }
      }, undefined);
    }
    
    return items;
  }
  
  public cardDropped(droppedId: string, targetStateName: string): void {
    let item: any = TreeConfiguration.getWorkingTree().getProxyFor(droppedId).
      item;
    let stateAttributeName: string;
    for (let attributeName in this._selectedKind.properties) {
      if (this._selectedKind.properties[attributeName].type ===
        'StateMachine') {
        stateAttributeName = attributeName;
        break;
      }
    }
    
    item[stateAttributeName] = targetStateName;
    this._itemRepository.upsertItem(TreeConfiguration.getWorkingTree().
      getProxyFor(item.id).kind, item);
    
    this._changeDetectorRef.markForCheck();
  }
  
  public displayInformation(item: any): void {
    this._dialogService.openComponentDialog(DetailsDialogComponent, {
      data: {
        itemProxy: TreeConfiguration.getWorkingTree().getProxyFor(item.id)
      }
    }).updateSize('90%', '90%');
  }
  
  public navigate(item: any): void {
    this._navigationService.addTab('Explore', { id: item.id });
  }
}
