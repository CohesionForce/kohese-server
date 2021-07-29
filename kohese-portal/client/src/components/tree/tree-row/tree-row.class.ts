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
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese

export class TreeRow {
  get object() {
    return this._object;
  }

  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  set expanded(expanded: boolean) {
    this._expanded = expanded;
  }

  private _visible: boolean = true;
  get visible() {
    return this._visible;
  }
  set visible(visible: boolean) {
    this._visible = visible;
  }

  private _matchesFilter: boolean = false;
  get matchesFilter() {
    return this._matchesFilter;
  }
  set matchesFilter(matchesFilter: boolean) {
    this._matchesFilter = matchesFilter;
  }

  private _depth: number = 0;
  get depth() {
    return this._depth;
  }
  set depth(depth: number) {
    this._depth = depth;
  }

  private _path: Array<string> = [];
  get path() {
    return this._path;
  }

  private _updateVisibleRows: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get updateVisibleRows() {
    return this._updateVisibleRows;
  }

  public constructor(protected _object: any) {
  }

  public getText(): string {
    // May be implemented externally
    return this._object.toString();
  }

  public getTags(): Array<string> {
    return [];
  }

  public getIcon(): string {
    // May be implemented externally
    return '';
  }

  public isRowFocused(): boolean {
    // May be implemented externally
    return false;
  }

  public rowFocused(): void {
    // May be implemented externally
  }

  public isRowSelected(): boolean {
    // May be implemented externally
    return false;
  }

  public rowSelected(): void {
    // May be implemented externally
  }

  public isRowRoot(): boolean {
    // May be implemented externally
    return false;
  }

  public hasChildren(): boolean {
    // May be implemented externally
    return false;
  }

  public isMultiselectEnabled(): boolean {
    // May be implemented externally
    return false;
  }

  public hasError(): boolean {
    return false;
  }

  public refresh(): void {
    // May be implemented externally
  }
}
