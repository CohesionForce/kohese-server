import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../details/details.component';
import { FormatDefinition,
  FormatDefinitionType } from '../../type-editor/FormatDefinition.interface';
import { PropertyDefinition } from '../../type-editor/PropertyDefinition.interface';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';

import { Observable, Subscription } from 'rxjs';

@Component({
  selector : 'assignment-dashboard',
  templateUrl : './assignment-dashboard.component.html',
  styleUrls : ['./assignment-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentDashboardComponent implements OnInit, OnDestroy {
  /* Data */
  @Input()
  assignmentListStream : Observable<Array<ItemProxy>>;
  assignmentList : Array<ItemProxy> = [];
  sortedAssignmentList : Array<ItemProxy> = [];
  assignmentListSub : Subscription;

  @Input()
  dashboardSelectionStream : Observable<DashboardSelections>;
  assignmentType : DashboardSelections;
  assignmentTypeSub : Subscription;

  assignmentTypes = {};
  
  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }
  
  get FormatDefinitionType() {
    return FormatDefinitionType;
  }
  
  get TreeConfiguration() {
    return TreeConfiguration;
  }

  constructor(private navigationService : NavigationService,
    private changeRef : ChangeDetectorRef, private _itemRepository:
    ItemRepository, private _dialogService: DialogService) {
    this.assignmentTypes = DashboardSelections;
    console.log(this.assignmentTypes)
  }

  ngOnInit() {
    this.assignmentTypeSub =this.dashboardSelectionStream.subscribe((dashboardType)=>{
      this.assignmentType = dashboardType;
      this.sortedAssignmentList = this.sortAssignments(this.assignmentType, this.assignmentList);
      this.changeRef.markForCheck();
    })
    this.assignmentListSub = this.assignmentListStream.subscribe((assignmentList)=>{
      this.assignmentList = assignmentList;
      this.sortedAssignmentList = this.sortAssignments(this.assignmentType, assignmentList);
      this.changeRef.markForCheck();
    })
  }

  ngOnDestroy() {
    this.assignmentTypeSub.unsubscribe();
    this.assignmentListSub.unsubscribe();
  }
  
  public getViewModel(itemProxy: ItemProxy): any {
    return TreeConfiguration.getWorkingTree().getProxyFor('view-' + itemProxy.
      kind.toLowerCase()).item;
  }
  
  public save(itemProxy: ItemProxy): void {
    this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item).then(
      (returnedItemProxy: ItemProxy) => {
      this.changeRef.markForCheck();
    });
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
  }
  
  public discardChanges(itemProxy: ItemProxy): void {
    this._itemRepository.fetchItem(TreeConfiguration.getWorkingTree().
      getProxyFor(itemProxy.item.id));
    this._editableSet.splice(this._editableSet.indexOf(itemProxy.item.id), 1);
    this.changeRef.markForCheck();
  }
  
  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: itemProxy
      }
    }).updateSize('90%', '90%');
  }
  
  public navigate(itemProxy: ItemProxy): void {
    this.navigationService.addTab('Explore', { id: itemProxy.item.id });
  }
  
  sortAssignments(sortStrategy : DashboardSelections, assignmentList : Array<ItemProxy>) {
    let sortedArray = [];
    switch (sortStrategy) {
      /////////////////
      case (DashboardSelections.DUE_ASSIGNMENTS) :
        sortedArray = assignmentList.filter((assignment)=>{
          return (!this.isCompleted(assignment) && assignment.item.estimatedCompletion)
        }).sort((a, b)=>{
          if (a.item.estimatedCompletion <= b.item.estimatedCompletion) {
            return -1;
          } else {
            return 1;
          }
        })
        break;
      /////////////////
      case (DashboardSelections.OPEN_ASSIGNMENTS) :
        sortedArray = assignmentList.filter((assignment)=>{
          return (!this.isCompleted(assignment))
        }).sort((a, b)=>{
          if (a.item.modifiedOn >= b.item.modifiedOn) {
            return 1;
          } else {
            return -1;
          }
        })
        break;
      /////////////////
      case (DashboardSelections.COMPLETED_ASSIGNMENTS) :
        sortedArray = assignmentList.filter((assignment)=>{
         return (this.isCompleted(assignment))
        }).sort((a, b)=>{
          if (a.item.modifiedOn >= b.item.modifiedOn) {
            return 1;
          } else {
            return -1;
          }
        })
        break;
      ////// This should never happen
      default :
        sortedArray = assignmentList;
        console.warn('Invalid Assignment Sort Strategy')

    }
    return sortedArray;
  }

  isCompleted(assignment : ItemProxy) : boolean {
    let types: Array<string> = [];
    let kindProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      assignment.kind);
    while (kindProxy) {
      types.push(kindProxy.item.name);
      kindProxy = TreeConfiguration.getWorkingTree().getProxyFor(kindProxy.
        item.base);
    }
    
    if (types.indexOf('Task') !== -1) {
      if (assignment.item.taskState === 'Completed') {
        return true;
      }
    } else if (types.indexOf('Action') !== -1) {
      if (assignment.item.actionState === 'Verified' ||
          assignment.item.actionState === 'Closed') {
          return true
        }
    }
    return false;
  }
}
