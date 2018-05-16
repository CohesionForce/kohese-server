import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
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
    private _itemRepository: ItemRepository, route: ActivatedRoute) {
    super(route);
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
          if (notification.proxy && (this._rootSubject.getValue().item.
            id === notification.proxy.item.id)) {
            this.buildRows();
          }
        });
        
        this._rootSubject.next(this._selectedTreeConfiguration.getRootProxy());
        
        this._route.params.subscribe((parameters: Params) => {
          this._rootSubject.next(this._selectedTreeConfiguration.getProxyFor(
            parameters['id']));
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
    
    let root: ItemProxy = this._rootSubject.getValue();
    let rootRow: TreeRow = this.buildRow(root);
    rootRow.getRowParentProxy = () => {
      return undefined;
    };
    rootRow.getRowChildrenProxies = () => {
      let rowChildrenProxies: Array<ItemProxy> = [];
      let rowIds: Array<string> = Object.keys(root.relations);
      for (let j: number = 0; j < rowIds.length; j++) {
        rowChildrenProxies.push(this.getRow(rowIds[j]).itemProxy);
      }
      
      return rowChildrenProxies;
    };
    rootRow.expanded = true;
    
    for (let referenceType in root.relations) {
      if (!this.getRow(referenceType)) {
        let row: TreeRow = this.buildRow(new ItemProxy('Internal', {
          id: referenceType,
          name: referenceType
        }));
        row.getRowParentProxy = () => {
          return root;
        };
        row.getRowChildrenProxies = () => {
          let rowChildrenProxies: Array<ItemProxy> = [];
          for (let type in root.relations[referenceType]) {
            for (let propertyId in root.relations[referenceType][type]) {
              rowChildrenProxies.push(this.getRow(propertyId).itemProxy);
            }
          }
          
          return rowChildrenProxies;
        };
        row.expanded = true;
      }
      for (let type in root.relations[referenceType]) {
        for (let propertyId in root.relations[referenceType][type]) {
          if (!this.getRow(propertyId)) {
            let row: TreeRow = this.buildRow(new ItemProxy('Internal', {
              id: propertyId,
              name: propertyId
            }));
            row.getRowParentProxy = () => {
              return this.getRow(referenceType).itemProxy;
            };
            row.getRowChildrenProxies = () => {
              let rowChildrenProxies: Array<ItemProxy> = [];
              let references: any = root.relations[referenceType][type][
                propertyId];
              if (references) {
                if (!Array.isArray(references)) {
                  references = [references];
                }
              } else {
                references = [];
              }
              
              for (let j: number = 0; j < references.length; j++) {
                rowChildrenProxies.push(references[j]);
              }
            
              return rowChildrenProxies;
            };
          }
          
          let reference: any = root.relations[referenceType][type][
            propertyId];
          if (reference) {
            if (!Array.isArray(reference)) {
              reference = [reference];
            }
            
            for (let j: number = 0; j < reference.length; j++) {
              let row: TreeRow = this.buildRow(this._selectedTreeConfiguration.
                getProxyFor(reference[j].item.id));
              row.getRowParentProxy = () => {
                return this.getRow(propertyId).itemProxy;
              };
              row.getRowChildrenProxies = () => {
                return [];
              };
            }
          }
        }
      }
    }
  }
  
  public postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }
  
  public rootChanged(): void {
    this.buildRows();
  }
}