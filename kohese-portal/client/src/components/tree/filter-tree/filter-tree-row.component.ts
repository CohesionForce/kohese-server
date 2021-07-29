/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { TreeRowComponent } from '../tree-row/tree-row.component';
import { Filter, FilterCriteriaConnection, FilterCriterion } from '../../filter/filter.class';

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

  public getIndentationArray(): Array<any> {
    let indentationArray: Array<any> = [];
    indentationArray.length = this.treeRow.depth;
    return indentationArray;
  }

  public getType(): string {
    return (this.treeRow.object instanceof FilterCriteriaConnection ?
      'FilterCriteriaConnection' :
      (this.treeRow.object instanceof FilterCriterion ? 'FilterCriterion' :
      'AddRowObject'));
  }

  public addConnection(type: string): void {
    // The type of this.treeRow.object should be AddRowObject
    this.addElement.emit(new AddElementEvent('FilterCriteriaConnection:' +
      type, this.treeRow.object.connection));
  }

  public addCriterion(): void {
    // The type of this.treeRow.object should be AddRowObject
    this.addElement.emit(new AddElementEvent('FilterCriterion', this.treeRow.
      object.connection));
  }
}
