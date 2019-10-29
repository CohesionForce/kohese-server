import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';

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
export class AssignmentDashboardComponent extends NavigatableComponent
                                          implements OnInit, OnDestroy {
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

  constructor(private navigationService : NavigationService,
              private changeRef : ChangeDetectorRef) {
    super (navigationService);
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
