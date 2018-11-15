import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren,
  QueryList, Input, OnInit, OnDestroy } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DialogService } from '../../../services/dialog/dialog.service';
import { CompareItemsComponent } from '../item-comparison/compare-items.component';
import { Comparison, Property } from '../comparison.class';

@Component({
  selector: 'change-summary',
  templateUrl: './change-summary.component.html',
  styleUrls: ['./change-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeSummaryComponent implements OnInit, OnDestroy {
  private _comparisonsSubject: BehaviorSubject<Array<Comparison>>;
  get comparisonsSubject() {
    return this._comparisonsSubject;
  }
  @Input('comparisonsSubject')
  set comparisonsSubject(comparisonsSubject:
    BehaviorSubject<Array<Comparison>>) {
    this._comparisonsSubject = comparisonsSubject;
  }
  
  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  @Input('expanded')
  set expanded(expanded: boolean) {
    this._expanded = expanded;
  }
  
  private _showDifferencesOnlySubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }
  @Input('showDifferencesOnlySubject')
  set showDifferencesOnlySubject(showDifferencesOnlySubject:
    BehaviorSubject<boolean>) {
    this._showDifferencesOnlySubject = showDifferencesOnlySubject;
  }
  
  @ViewChildren(MatExpansionPanel)
  private _differencePanels: QueryList<MatExpansionPanel>;
  
  get Comparison() {
    return Comparison;
  }
  
  private _comparisonsSubscription: Subscription;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
  }
  
  public ngOnInit(): void {
    this._comparisonsSubscription = this._comparisonsSubject.subscribe((
      comparisons: Array<Comparison>) => {
      this._changeDetectorRef.markForCheck();
    });
  }
  
  public ngOnDestroy(): void {
    this._comparisonsSubscription.unsubscribe();
  }
  
  public expandAll(): void {
    let differencePanels: Array<MatExpansionPanel> = this._differencePanels.
      toArray();
    for (let j: number = 0; j < differencePanels.length; j++) {
      differencePanels[j].open();
    }
  }
  
  public collapseAll(): void {
    let differencePanels: Array<MatExpansionPanel> = this._differencePanels.
      toArray();
    for (let j: number = 0; j < differencePanels.length; j++) {
      differencePanels[j].close();
    }
  }
  
  public openComparisonDialog(comparison: Comparison): void {
    this._dialogService.openComponentDialog(CompareItemsComponent, {
      data: {
        //baseProxy: comparison.baseObject,
        //changeProxy: comparison.changeObject,
        editable: false
      }
    }).updateSize('90%', '90%');
  }
  
  public hasChanges(comparison: Comparison): boolean {
    let hasChanges: boolean = false;
    let properties: Array<Property> = Array.from(comparison.
      propertyComparisonMap.keys());
    for (let j: number = 0; j < properties.length; j++) {
      let changes: Array<any> = comparison.propertyComparisonMap.get(
        properties[j]);
      if ((changes.length > 1) || changes[0].added || changes[0].removed) {
        hasChanges = true;
        break;
      }
    }
    
    return hasChanges;
  }
}