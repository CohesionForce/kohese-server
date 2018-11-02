import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren,
  QueryList, Input } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

import { DialogService } from '../../../services/dialog/dialog.service';
import { CompareItemsComponent } from '../item-comparison/compare-items.component';
import { Comparison, Property } from '../comparison.class';

@Component({
  selector: 'change-summary',
  templateUrl: './change-summary.component.html',
  styleUrls: ['./change-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeSummaryComponent {
  private _comparisonsSubject: BehaviorSubject<Array<Comparison>>;
  get comparisonsSubject() {
    return this._comparisonsSubject;
  }
  @Input('comparisonsSubject')
  set comparisonsSubject(comparisonsSubject:
    BehaviorSubject<Array<Comparison>>) {
    this._comparisonsSubject = comparisonsSubject;
  }
  
  @ViewChildren(MatExpansionPanel)
  private _differencePanels: QueryList<MatExpansionPanel>;
  
  get Array() {
    return Array;
  }
  
  get Comparison() {
    return Comparison;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService) {
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
  
  public getChangeStyle(change: any): object {
    let style: object = {};
    if (change.added) {
      style = {
        'background-color': 'lightgreen',
        'color': 'darkgreen'
      };
    } else if (change.removed) {
      style = {
        'background-color': 'lightcoral',
        'color': 'darkred'
      };
    }
    
    return style;
  }
}