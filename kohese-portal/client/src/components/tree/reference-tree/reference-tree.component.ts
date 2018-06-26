import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/compare-items.component';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row.class';
import { MenuAction } from '../tree-row.component';

@Component({
  selector: 'reference-tree',
  templateUrl: './reference-tree.component.html',
  styleUrls: ['../tree.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferenceTreeComponent extends Tree implements OnInit, OnDestroy {
  private _selectedTreeConfiguration: TreeConfiguration;

  private _itemRepositorySubscription: Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository, route: ActivatedRoute,
    dialogService: DialogService, private _navigationService:
    NavigationService, private _dynamicTypesService: DynamicTypesService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    let stagedVersionComparisonAction: MenuAction = new MenuAction('Compare ' +
      'Against Staged Version', 'Compare this Item against the staged ' +
      'version of this Item', 'fa fa-exchange', (row: TreeRow) => {
      let enable: boolean = false;
      let path: Array<string> = (row.object as Reference).path;
      let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[
        path.length - 1]);
      if (proxy) {
        enable = proxy.status['Staged'];
      }
      
      return enable;
      }, (row: TreeRow) => {
      this.openComparisonDialog(row, VersionDesignator.STAGED_VERSION);
    });
    this.rootMenuActions.push(stagedVersionComparisonAction);
    this.menuActions.push(stagedVersionComparisonAction);
    
    let lastCommittedVersionComparisonAction: MenuAction = new MenuAction(
      'Compare Against Last Committed Version', 'Compares this Item against ' +
      'the last committed version of this Item', 'fa fa-exchange', (row:
      TreeRow) => {
      let enable: boolean = false;
      let path: Array<string> = (row.object as Reference).path;
      let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[
        path.length - 1]);
      if (proxy) {
        if (proxy.history) {
          enable = (proxy.history.length > 0);
        } else {
          this._itemRepository.getHistoryFor(proxy);
        }
      }
      
      return enable;
      }, (row: TreeRow) => {
      this.openComparisonDialog(row, VersionDesignator.LAST_COMMITTED_VERSION);
    });
    this.rootMenuActions.push(lastCommittedVersionComparisonAction);
    this.menuActions.push(lastCommittedVersionComparisonAction);
    
    let itemComparisonAction: MenuAction = new MenuAction('Compare Against...',
      'Compare this Item against another Item', 'fa fa-exchange', (row:
      TreeRow) => {
      return true;
      }, (row: TreeRow) => {
      this.openComparisonDialog(row, undefined);
    });
    this.rootMenuActions.push(itemComparisonAction);
    this.menuActions.push(itemComparisonAction);
    
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._selectedTreeConfiguration = treeConfigurationObject.config;
        
        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }
        this._treeConfigurationSubscription = this._selectedTreeConfiguration.
          getChangeSubject().subscribe((notification: any) => {
          let reference: Reference = (<Reference> this._rootSubject.getValue().
            object);
          if (notification.proxy && ((reference.path[reference.path.length -
            1] === notification.proxy.item.id) || this.isRootReferencedBy(
            notification.proxy))) {
            this.buildRows(reference);
          }
        });
        
        let root: Reference = new Reference([this._selectedTreeConfiguration.
          getRootProxy().item.id]);
        this.buildRows(root);
        this._rootSubject.next(this.getRow(root.path.join()));
        
        this._route.params.subscribe((parameters: Params) => {
          root = new Reference([this._selectedTreeConfiguration.
            getProxyFor(parameters['id']).item.id]);
          this.buildRows(root);
          this._rootSubject.next(this.getRow(root.path.join()));
        });
        
        this.showSelection();
      }
    });
  }
  
  public ngOnDestroy(): void {
    this.prepareForDismantling();
    if (this._treeConfigurationSubscription) {
      this._treeConfigurationSubscription.unsubscribe();
    }
    this._itemRepositorySubscription.unsubscribe();
  }
  
  private buildRows(root: Reference): void {
    this.clear();
    
    let rootRow: TreeRow = this.buildRow(root);
    rootRow.expanded = true;
    let rootProxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(
      root.path[0]);
    
    for (let referenceType in rootProxy.relations) {
      if (!this.getRow(referenceType)) {
        let row: TreeRow = this.buildRow(new Reference([rootProxy.item.id,
          referenceType]));
        row.expanded = true;
      }
      for (let type in rootProxy.relations[referenceType]) {
        for (let propertyId in rootProxy.relations[referenceType][type]) {
          if (!this.getRow(propertyId)) {
            let row: TreeRow = this.buildRow(new Reference([rootProxy.item.id,
              referenceType, type, propertyId]));
            row.expanded = true;
          }
          
          let reference: any = rootProxy.relations[referenceType][type][
            propertyId];
          if (reference) {
            if (!Array.isArray(reference)) {
              reference = [reference];
            }
            
            for (let j: number = 0; j < reference.length; j++) {
              let row: TreeRow = this.buildRow(new Reference([rootProxy.item.
                id, referenceType, type, propertyId, reference[j].item.id]));
            }
          }
        }
      }
    }
  }
  
  public getId(row: TreeRow): string {
    return (row.object as Reference).path.join();
  }
  
  public getParent(row: TreeRow): TreeRow {
    let parentPath: Array<string> = (row.object as Reference).path.slice(0);
    parentPath.length = ((4 === parentPath.length) ? (parentPath.length - 2) :
      (parentPath.length - 1));
    return this.getRow(parentPath.join());
  }
  
  public getChildren(row: TreeRow): Array<TreeRow> {
    let children: Array<TreeRow> = [];
    let path: Array<string> = (row.object as Reference).path;
    let rootProxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor((
      this._rootSubject.getValue().object as Reference).path[0]);
    if (path.length > 1) {
      path = path.slice(1);
      if (path.length > 2) {
        if (3 === path.length) {
          let references: any = rootProxy.relations[path[0]][path[1]][path[2]];
          if (references) {
            if (!Array.isArray(references)) {
              references = [references];
            }
          } else {
            references = [];
          }
          
          for (let j: number = 0; j < references.length; j++) {
            children.push(this.getRow([rootProxy.item.id, path[0], path[1],
              path[2], references[j].item.id].join()));
          }
        }
      } else {
        for (let type in rootProxy.relations[path[0]]) {
          for (let propertyId in rootProxy.relations[path[0]][type]) {
            children.push(this.getRow([rootProxy.item.id, path[0], type,
              propertyId].join()));
          }
        }
      }
    } else {
      for (let referenceCategory in rootProxy.relations) {
        children.push(this.getRow([rootProxy.item.id, referenceCategory].
          join()));
      }
    }
    
    return children;
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  public rowSelected(row: TreeRow): void {
    let path: Array<string> = (row.object as Reference).path;
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[
      path.length - 1]);
    if (proxy) {
      this._navigationService.navigate('Explore', { id: proxy.item.id });
    }
  }
  
  public getText(object: any): string {
    let path: Array<string> = (object as Reference).path;
    let lastSegment: string = path[path.length - 1];
    let text = lastSegment;
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(
      lastSegment);
    if (proxy) {
      text = proxy.item.name;
    }
    
    return text;
  }
  
  public getIcon(object: any): string {
    let iconString: string = 'fa fa-wrench';
    let path: Array<string> = (object as Reference).path;
    let lastSegment: string = path[path.length - 1];
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(
      lastSegment);
    if (proxy) {
      let koheseType: KoheseType = proxy.model.type;
      if (koheseType && koheseType.viewModelProxy) {
        iconString = koheseType.viewModelProxy.item.icon;
      }
    }
    
    return iconString;
  }
  
  private openComparisonDialog(row: TreeRow, changeVersionDesignator:
    VersionDesignator): void {
    let path: Array<string> = (row.object as Reference).path;
    let compareItemsDialogParameters: any = {
      baseProxy: this._selectedTreeConfiguration.getProxyFor(path[path.length -
        1]),
      editable: true
    };
    
    if (null != changeVersionDesignator) {
      compareItemsDialogParameters['changeProxy'] =
        compareItemsDialogParameters.baseProxy;
      compareItemsDialogParameters['changeVersion'] = changeVersionDesignator;
    }
    
    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: compareItemsDialogParameters
    }).updateSize('90%', '90%');
  }
  
  private isRootReferencedBy(proxy: ItemProxy): boolean {
    let root: ItemProxy = this._selectedTreeConfiguration.getProxyFor((this.
      _rootSubject.getValue().object as Reference).path[0]);
    for (let type in root.relations['referencedBy']) {
      for (let propertyId in root.relations['referencedBy'][type]) {
        let reference: any = root.relations['referencedBy'][type][propertyId];
        if (reference) {
          if (!Array.isArray(reference)) {
            reference = [reference];
          }
          
          for (let j: number = 0; j < reference.length; j++) {
            if (reference[j] === proxy) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }
}

class Reference {
  public constructor(public path: Array<string>) {
  }
}