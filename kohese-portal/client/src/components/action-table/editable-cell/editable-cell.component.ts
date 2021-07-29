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
import { Input, Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';

// Other External Dependencies

// Kohese

@Component({
  selector: 'editable-cell',
  templateUrl: './editable-cell.component.html'
})
export class EditableCellComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  column: string;
  @Input()
  action: any;
  @Input()
  editableStream: Observable<boolean>;
  @Input()
  rowActionStream: Observable<any>;
  rowActionStreamSub: Subscription;
  editableStreamSub: Subscription;
  editable: boolean = false;
  editableField: boolean = false;

  initialized: boolean = false;

  constructor() {

  }

  ngOnInit() {
    if (this.action.proxy.model.internal) {
      this.editableField = false;
    } else {
      this.editableStreamSub = this.editableStream.subscribe((editable) => {
        if (!editable) {
          this.editable = false;
        }
      })

      this.initialized = true;
      if (this.action.proxy.model.item.name === 'Task' ||
        this.action.proxy.model.item.name === 'Action') {
        this.editableField = true;
      }
      this.rowActionStreamSub = this.rowActionStream.subscribe(rowAction => {
        if (rowAction.rowProxy.item.id === this.action.proxy.item.id) {
          if (rowAction.type === 'Edit') {
            this.editable = !this.editable
          } else if (rowAction.type === 'Save') {
            this.editable = false;
          }
        }
      })
    }
  }

  ngOnDestroy() {
    if (this.editableStreamSub) {
      this.editableStreamSub.unsubscribe();
    }
    if (this.rowActionStreamSub) {
      this.rowActionStreamSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {

      if (changes['action']) {
        this.action = changes['action'].currentValue;
        if (this.action.proxy.model.item.name === 'Task' ||
          this.action.proxy.model.item.name === 'Action') {
          this.editableField = true;
        } else {
          this.editableField = false;
        }
      }
    }
  }
}
