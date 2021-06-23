import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { DialogService } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { CompareItemsComponent,
  VersionDesignator } from '../../compare-items/item-comparison/compare-items.component';
import { Tree } from '../tree.class';
import { TreeRow } from '../tree-row/tree-row.class';
import { Action } from '../tree-row/tree-row.component';

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

  private static readonly PATH_SEGMENT_SEPARATOR: string = '\0';

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository, route: ActivatedRoute,
    dialogService: DialogService, private _navigationService:
    NavigationService, private _dynamicTypesService: DynamicTypesService) {
    super(route, dialogService);
  }

  public ngOnInit(): void {
    // TODO: Reimplement when "User can stage tree" task is completed

    // let stagedVersionComparisonAction: Action = new Action('Compare ' +
    //   'Against Staged Version', 'Compare this Item against the staged ' +
    //   'version of this Item', 'fa fa-exchange', (object: any) => {
    //   let enable: boolean = false;
    //   let path: Array<string> = (object as Array<string>);
    //   let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[
    //     path.length - 1]);
    //   if (proxy) {
    //     enable = (proxy.vcStatus.statusArray.filter((status: string) => {
    //       return status.startsWith('INDEX');
    //     }).length > 0);
    //   }

    //   return enable;
    //   }, (object: any) => {
    //   this.openComparisonDialog((object as Array<string>), VersionDesignator.
    //     STAGED_VERSION);
    // });
    // this.rootMenuActions.push(stagedVersionComparisonAction);
    // this.menuActions.push(stagedVersionComparisonAction);

    let lastCommittedVersionComparisonAction: Action = new Action(
      'Compare Against Last Committed Version', 'Compares this Item against ' +
      'the last committed version of this Item', 'fa fa-exchange', (object:
      any) => {
      let enable: boolean = false;
      let path: Array<string> = (object as Array<string>);
      let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[
        path.length - 1]);
      if (proxy) {
        enable = (0 === proxy.vcStatus.statusArray.filter((status: string) => {
          return status.endsWith('_NEW');
        }).length);
      }

      return enable;
      }, (object: any) => {
      this.openComparisonDialog((object as Array<string>), VersionDesignator.
        LAST_COMMITTED_VERSION);
    });
    this.rootMenuActions.push(lastCommittedVersionComparisonAction);
    this.menuActions.push(lastCommittedVersionComparisonAction);

    let itemComparisonAction: Action = new Action('Compare Against...',
      'Compare this Item against another Item', 'fa fa-exchange', (object:
      any) => {
      return true;
      }, (object: any) => {
      this.openComparisonDialog((object as Array<string>), undefined);
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
          let path: Array<string> = (<Array<string>> this.rootSubject.
            getValue());
          switch (notification.type) {
            case 'delete': {
                // Root Row is deleted so reset to default of Root Proxy
                if (this.rootSubject.getValue()[0] === notification.id) {
                  let root: Array<string> = [this._selectedTreeConfiguration.getRootProxy().item.id];
                  this.absoluteRoot = [this._selectedTreeConfiguration.getRootProxy().item.id];
                  this.buildRows(root);
                  this.rootSubject.next(root);
                }
              }
              break;
            default:
              if (notification.proxy && ((path[path.length - 1] === notification.proxy.item.id) ||
                this.isRootReferencedBy(notification.proxy))) {
                this.buildRows(path);
              }
          }
        });

        let root: Array<string> = [this._selectedTreeConfiguration.getRootProxy().item.id];
        this.absoluteRoot = [this._selectedTreeConfiguration.getRootProxy().item.id];
        this.buildRows(root);
        this.rootSubject.next(root);

        this._route.params.subscribe((parameters: Params) => {
          let itemProxy: ItemProxy = this._selectedTreeConfiguration.
            getProxyFor(parameters['id']);
          if (itemProxy) {
            root = [itemProxy.item.id];
            this.buildRows(root);
            this.rootSubject.next(root);
          }
        });

        this.initialize();

        this.showFocus();
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

  protected preTreeTraversalActivity() {
    // Check to see if the rootRow is in the map
    let root = this.rootSubject.getValue();
    let rowId = this.getId(root);
    let rootRow = this.getRow(rowId);
    if (!rootRow) {
      // rootRow is not in the map, so build the required rows
      this.buildRows(root);
    }
  }

  private buildRows(root: Array<string>): void {
    this.clear();

    let rootRow: TreeRow = this.buildRow(root);
    rootRow.expanded = true;
    let rootProxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(
      root[0]);

    for (let referenceType in rootProxy.relations) {
      let referenceTypePath: Array<string> = [rootProxy.item.id,
        referenceType];
      if (!this.getRow(this.getId(referenceTypePath))) {
        let row: TreeRow = this.buildRow(referenceTypePath);
        row.expanded = true;
      }
      for (let type in rootProxy.relations[referenceType]) {
        for (let propertyId in rootProxy.relations[referenceType][type]) {
          let propertyIdPath: Array<string> = [rootProxy.item.id,
            referenceType, type, propertyId];
          if (!this.getRow(this.getId(propertyIdPath))) {
            let row: TreeRow = this.buildRow(propertyIdPath);
            row.expanded = true;
          }

          let reference: any = rootProxy.relations[referenceType][type][
            propertyId];
          if (reference) {
            if (!Array.isArray(reference)) {
              reference = [reference];
            }

            for (let j: number = 0; j < reference.length; j++) {
              let row: TreeRow = this.buildRow([rootProxy.item.id,
                referenceType, type, propertyId, reference[j].item.id]);
            }
          }
        }
      }
    }
  }

  protected getId(object: any): any {
    return (object as Array<string>).join(ReferenceTreeComponent.
      PATH_SEGMENT_SEPARATOR);
  }

  protected getParent(object: any): any {
    let parentPath: Array<string> = (object as Array<string>).slice(0);
    parentPath.length = ((4 === parentPath.length) ? (parentPath.length - 2) :
      (parentPath.length - 1));
    if (parentPath.length > 0) {
      return parentPath;
    } else {
      return undefined;
    }
  }

  protected getChildren(object: any): Array<any> {
    let children: Array<Array<string>> = [];
    let path: Array<string> = (object as Array<string>);
    let rootProxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor((
      this.rootSubject.getValue() as Array<string>)[0]);
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
            children.push([rootProxy.item.id, path[0], path[1],
              path[2], references[j].item.id]);
          }
        }
      } else {
        for (let type in rootProxy.relations[path[0]]) {
          for (let propertyId in rootProxy.relations[path[0]][type]) {
            children.push([rootProxy.item.id, path[0], type,
              propertyId]);
          }
        }
      }
    } else {
      for (let referenceCategory in rootProxy.relations) {
        children.push([rootProxy.item.id, referenceCategory]);
      }
    }

    return children;
  }

  protected postTreeTraversalActivity(): void {
    this._changeDetectorRef.markForCheck();
  }

  protected rowFocused(row: TreeRow): void {
    let path: Array<string> = (row.object as Array<string>);
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(path[
      path.length - 1]);
    if (proxy) {
      this._navigationService.navigate('Explore', { id: proxy.item.id });
    }
  }

  protected getText(object: any): string {
    let path: Array<string> = (object as Array<string>);
    let lastSegment: string = path[path.length - 1];
    let text = lastSegment;
    let proxy: ItemProxy = this._selectedTreeConfiguration.getProxyFor(
      lastSegment);
    if (proxy) {
      text = proxy.item.name;
    }

    return text;
  }

  protected getIcon(object: any): string {
    let iconString: string = 'fa fa-wrench';
    let path: Array<string> = (object as Array<string>);
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

  private openComparisonDialog(path: Array<string>, changeVersionDesignator:
    VersionDesignator): void {
    let compareItemsDialogParameters: any = {
      baseProxy: this._selectedTreeConfiguration.getProxyFor(path[path.length -
        1]),
      editable: true
    };

    if (null != changeVersionDesignator) {
      compareItemsDialogParameters['changeProxy'] =
        compareItemsDialogParameters.baseProxy;
      compareItemsDialogParameters['baseVersion'] = changeVersionDesignator;
    }

    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: compareItemsDialogParameters
    }).updateSize('90%', '90%');
  }

  private isRootReferencedBy(proxy: ItemProxy): boolean {
    let root: ItemProxy = this._selectedTreeConfiguration.getProxyFor((this.
      rootSubject.getValue() as Array<string>)[0]);
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
