import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output,
  EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { TreeRowComponent } from '../tree-row/tree-row.component';
import { Filter, FilterCriteriaConnection,
  FilterCriterion } from '../../filter/filter.class';

class AddElementEvent {
  get type() {
    return this._type;
  }
  
  get connection() {
    return this._connection;
  }
  
  public constructor(private _type: string, private _connection:
    FilterCriteriaConnection) {
  }
}

@Component({
  selector: 'filter-tree-row',
  templateUrl: './filter-tree-row.component.html',
  styleUrls: ['../tree-row/tree-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTreeRowComponent extends TreeRowComponent {
  private _filterSubject: BehaviorSubject<Filter>;
  get filterSubject() {
    return this._filterSubject;
  }
  @Input('filterSubject')
  set filterSubject(filterSubject: BehaviorSubject<Filter>) {
    this._filterSubject = filterSubject;
  }
  
  get FilterCriterion() {
    return FilterCriterion;
  }
  
  @Output()
  public addElement: EventEmitter<AddElementEvent> =
    new EventEmitter<AddElementEvent>();
  
  public constructor(changeDetectorRef: ChangeDetectorRef) {
    super(changeDetectorRef);
  }
  
  public getIndentationStyle(): object {
    return {
      'padding-left': (this.treeRow.depth * 30) + 'px' 
    };
  }
  
  public getType(): string {
    return (this.treeRow.object instanceof FilterCriteriaConnection ?
      'FilterCriteriaConnection' :
      (this.treeRow.object instanceof FilterCriterion ? 'FilterCriterion' :
      'AddRowObject'));
  }
  
  public addConnection(): void {
    // The type of this.treeRow.object should be AddRowObject
    this.addElement.emit(new AddElementEvent('FilterCriteriaConnection', this.
      treeRow.object.connection));
  }
  
  public addCriterion(): void {
    // The type of this.treeRow.object should be AddRowObject
    this.addElement.emit(new AddElementEvent('FilterCriterion', this.treeRow.
      object.connection));
  }
}