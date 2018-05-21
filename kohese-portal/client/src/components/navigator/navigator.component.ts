import {
  Component, AfterViewInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChildren, QueryList
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../services/dialog/dialog.service';
import { Tree } from '../tree/tree.class';
import { TreeRow } from '../tree/tree-row.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { Filter } from '../filter/filter.class';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigatorComponent implements AfterViewInit, OnDestroy {
  /* Data */
  @ViewChildren('defaultTree')
  private _defaultTreeQueryList: QueryList<Tree>;
  @ViewChildren('referenceTree')
  private _referenceTreeQueryList: QueryList<Tree>;
  
  private _filterSubject: BehaviorSubject<Filter> =
    new BehaviorSubject<Filter>(new Filter());
  
  private _viewMap: any = {
    'Default': '',
    'References': '',
    'Version Control': ''
  };
  get viewMap() {
    return this._viewMap;
  }
  
  public selectedViewStream: BehaviorSubject<string> =
    new BehaviorSubject<string>('Default');
  
  private _filterSubscription: Subscription;
  
  public constructor(private _changeDetector: ChangeDetectorRef,
    private _dialogService: DialogService) {
  }
  
  public ngAfterViewInit(): void {
    let defaultTree: Tree = this._defaultTreeQueryList.toArray()[0];
    this.processTree(defaultTree);
    this._viewMap['Default'] = defaultTree;
    this._viewMap['Version Control'] = this._viewMap['Default'];
    
    this._defaultTreeQueryList.changes.subscribe((queryList: QueryList<Tree>) => {
      defaultTree = queryList.toArray()[0];
      if (defaultTree) {
        this.processTree(defaultTree);
        this._viewMap['Default'] = defaultTree;
        this._viewMap['Version Control'] = this._viewMap['Default'];
      }
    });
    
    this._referenceTreeQueryList.changes.subscribe((queryList: QueryList<Tree>) => {
      let referenceTree: Tree = queryList.toArray()[0];
      if (referenceTree) {
        this.processTree(referenceTree);
        this._viewMap['References'] = referenceTree;
      }
    });
    
    this._filterSubscription = this._filterSubject.subscribe((filter:
      Filter) => {
      this._viewMap[this.selectedViewStream.getValue()].showRows();
    });
  }
  
  public ngOnDestroy(): void {
    this._filterSubscription.unsubscribe();
  }
  
  public viewSelectionChanged(viewSelected: string): void {
    let filter: Filter = this._filterSubject.getValue();
    switch (viewSelected) {
      case 'Version Control':
        filter.hasUncommittedChanges = true;
        filter.hasUnsavedChanges = false;
        break;
      default:
        filter.hasUncommittedChanges = false;
    }

    this.selectedViewStream.next(viewSelected);
    this._changeDetector.detectChanges();
    this._viewMap[viewSelected].showRows();
  }
  
  public openFilterDialog(): void {
    this._dialogService.openComponentDialog(FilterComponent, {
      data: {
        filter: this._filterSubject.getValue()
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((filter: Filter) => {
      if (filter) {
        this._filterSubject.next(filter);
      } else {
        this._filterSubject.next(new Filter());
      }
    });
  }
  
  public removeFilter(): void {
    this._filterSubject.next(new Filter());
  }
  
  private processTree(tree: Tree): void {
    tree.preRowProcessingActivity = (row: TreeRow) => {
      let filter: Filter = this._filterSubject.getValue();
      let show: boolean = true;
      row.matchesFilter = (-1 !== filter.filter([row.itemProxy]).indexOf(row.
        itemProxy));
      if (!row.matchesFilter) {
        let recursiveFilteringFunction: (r: TreeRow) => void = (r: TreeRow) => {
          let rowChildrenProxies: Array<ItemProxy> = r.getRowChildrenProxies();
          for (let j: number = 0; j < rowChildrenProxies.length; j++) {
            let matches: boolean = (-1 !== filter.filter([rowChildrenProxies[
              j]]).indexOf(rowChildrenProxies[j]));
            if (!matches) {
              recursiveFilteringFunction(tree.getRow(rowChildrenProxies[j].
                item.id));
            }
            
            if (matches) {
              show = true;
              break;
            }
          }
        };
        recursiveFilteringFunction(row);
      }
    
      if (show !== row.visible) {
        row.visible = show;
      }
    };
  }
}
