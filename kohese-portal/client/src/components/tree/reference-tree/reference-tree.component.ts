import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
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
    NavigationService) {
    super(route, dialogService);
  }
  
  public ngOnInit(): void {
    this._itemRepositorySubscription = this._itemRepository.getTreeConfig()
      .subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this._selectedTreeConfiguration = treeConfigurationObject.config;
        
        if (this._treeConfigurationSubscription) {
          this._treeConfigurationSubscription.unsubscribe();
        }
        this._treeConfigurationSubscription = this._selectedTreeConfiguration.
          getChangeSubject().subscribe((notification: any) => {
          let reference: Reference = (this._rootSubject.getValue().object as Reference);
          if (notification.proxy && (reference.path[reference.path.length - 1] === notification.proxy.item.id)) {
            this.buildRows();
          }
        });
        
        this._rootSubject.next(this.buildRow(new Reference([this.
          _selectedTreeConfiguration.getRootProxy().item.id])));
        
        this._route.params.subscribe((parameters: Params) => {
          this._rootSubject.next(this.buildRow(new Reference([this._selectedTreeConfiguration.getProxyFor(
            parameters['id']).item.id])));
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
  
  private buildRows(): void {
    this.clear();
    
    let rootRow: TreeRow = this._rootSubject.getValue();
    rootRow.expanded = true;
    let root: ItemProxy = this._selectedTreeConfiguration.getProxyFor((<Reference> rootRow.
      object).path[0]);
    
    for (let referenceType in root.relations) {
      if (!this.getRow(referenceType)) {
        let row: TreeRow = this.buildRow(new Reference([root.item.id, referenceType]));
        row.expanded = true;
      }
      for (let type in root.relations[referenceType]) {
        for (let propertyId in root.relations[referenceType][type]) {
          if (!this.getRow(propertyId)) {
            let row: TreeRow = this.buildRow(new Reference([root.item.id, referenceType, type, propertyId]));
            row.expanded = true;
          }
          
          let reference: any = root.relations[referenceType][type][
            propertyId];
          if (reference) {
            if (!Array.isArray(reference)) {
              reference = [reference];
            }
            
            for (let j: number = 0; j < reference.length; j++) {
              let row: TreeRow = this.buildRow(new Reference([root.item.id, referenceType, type, propertyId,
                reference[j].item.id]));
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
    parentPath.length = parentPath.length - 1;
    return this.getRow(parentPath.join());
  }
  
  public getChildren(row: TreeRow): Array<TreeRow> {
    let children: Array<TreeRow> = [];
    let path: Array<string> = (row.object as Reference).path;
    let root: ItemProxy = this._selectedTreeConfiguration.getProxyFor((this.
      _rootSubject.getValue().object as Reference).path[0]);
    if (path.length > 1) {
      path = path.slice(1);
      if (path.length > 2) {
        if (3 === path.length) {
          let references: any = root.relations[path[0]][path[1]][
            path[2]];
          if (references) {
            if (!Array.isArray(references)) {
              references = [references];
            }
          } else {
            references = [];
          }
          
          for (let j: number = 0; j < references.length; j++) {
            children.push(references[j]);
          }
        }
      } else {
        for (let propertyId in root.relations[path[0]][path[1]]) {
          children.push(this.getRow([root.item.id, path[0], path[1], propertyId].join()));
        }
      }
    } else {
      for (let referenceCategory in root.relations) {
        children.push(this.getRow([root.item.id, referenceCategory].join()));
      }
    }
    
    return children;
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  public rootChanged(): void {
    this.buildRows();
  }
  
  public rowSelected(row: TreeRow): void {
    let path: Array<string> = (row.object as Reference).path;
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[path.length - 1]);
    if (proxy) {
      this._navigationService.navigate('Explore', { id: proxy.item.id });
    }
  }
  
  public getText(object: any): string {
    let path: Array<string> = (object as Reference).path;
    let lastSegment: string = path[path.length - 1];
    let text = lastSegment;
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(lastSegment);
    if (proxy) {
      text = proxy.item.name;
    }
    
    return text;
  }
  
  public getIcon(object: any): string {
    let iconString: string = 'fa fa-wrench';
    let path: Array<string> = (object as Reference).path;
    let lastSegment: string = path[path.length - 1];
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(lastSegment);
    if (proxy) {
      let koheseType: KoheseType = proxy.model.type;
      if (koheseType && koheseType.viewModelProxy) {
        iconString = koheseType.viewModelProxy.item.icon;
      }
    }
    
    return iconString;
  }
}

class Reference {
  public constructor(public path: Array<string>) {
  }
}