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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  Optional, Inject, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Other External Dependencies

// Kohese
import { Dialog } from '../dialog/Dialog.interface';
import { TreeService } from '../../services/tree/tree.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { DetailsComponent } from '../details/details.component';
import { DialogService } from '../../services/dialog/dialog.service';

class ElementMapValue {
  get parent() {
    return this._parent;
  }

  get depth() {
    return this._depth;
  }

  private _visible: boolean = true;
  get visible() {
    return this._visible;
  }
  set visible(visible: boolean) {
    this._visible = visible;
  }

  get favorite() {
    return this._favorite;
  }
  set favorite(value: boolean) {
    if(value === undefined) {
      this._favorite = false;
    } else {
      this._favorite = value;
    }
  }

  private _expanded: boolean = false;
  get expanded() {
    return this._expanded;
  }
  set expanded(expanded: boolean) {
    this._expanded = expanded;
  }

  get text() {
    return this._text;
  }

  get icon() {
    return this._icon;
  }

  public constructor (
                      private _parent: any,
                      private _depth: number,
                      private _text: string,
                      private _icon: string,
                      private _favorite: boolean
  ) {}
}

export class Action {
  get tooltip() {
    return this._tooltip;
  }

  get classes() {
    return this._classes;
  }

  get isVisible() {
    return this._isVisible;
  }

  get canExecute() {
    return this._canExecute;
  }

  get execute() {
    return this._execute;
  }

  public constructor(
                      private _tooltip: string,
                      private _classes: string,
                      private _isVisible: (element: any) => boolean,
                      private _canExecute: (element: any) => boolean,
                      private _execute: (element: any) => void
  ) {}
}

export class ToggleAction extends Action {
  get isSelected() {
    return this._isSelected;
  }

  public constructor(
                      tooltip: string,
                      classes: string,
                      isVisible: (element: any) => boolean,
                      canExecute: (element: any) => boolean,
                      private _isSelected: (element: any) => boolean,
                      execute: (element: any) => void
  ) {
    super(tooltip, classes, isVisible, canExecute, execute);
  }
}

export enum TreeComponentConfiguration {
  GET_CHILDREN, HAS_CHILDREN, GET_TEXT, GET_ICON, MAY_SELECT,
    ELEMENT_SELECTION_HANDLER
}

export interface ActionTitle {
  action: string,
  name: string
}

@Component({
  selector: 'tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent implements OnInit, AfterViewInit, Dialog {

  private _elementMap: Map<any, ElementMapValue> = new Map<any, ElementMapValue>();
  get elementMap() {
    return this._elementMap;
  }

  _absoluteRoot: any;
  get absoluteRoot() {
    return this._absoluteRoot;
  }
  private _root: any;
  @Input('root') set root(root: any) {
    this._root = root;
    if(!this._absoluteRoot) {
      this._absoluteRoot = root;
    }
  }
  get root() {
    return this._root;
  }

  _isImport: boolean = false;
  @Input('isImport')
  set isImport(value: boolean) {
    if(value) {
      this._isImport = value;
    } else {
      this._isImport = false;
    }
  }

  _getTitle: ActionTitle;
  get getTitle() {
    return this._getTitle;
  }
  @Input('getTitle')
  set getTitle(info: ActionTitle) {
    if(info !== undefined && info.action !== undefined && info.name !== undefined) {
      this._getTitle = info;
    } else {
      this._getTitle = {action: '', name: ''}
    }
  }

  @Input('displayFavoritesAndAnchor') _displayFavoritesAndAnchor: boolean = true;
  set displayFavoritesAndAnchor(flag: boolean) {
    this._displayFavoritesAndAnchor = flag;
  }
  get displayFavoritesAndAnchor() {
    return this._displayFavoritesAndAnchor;
  }

  private _getChildren: (element: any) => Array<any>;
  get getChildren() {
    return this._getChildren;
  }
  @Input('getChildren')
  set getChildren(getChildren: (element: any) => Array<any>) {
    this._getChildren = getChildren;
  }

  private _getParent: (element: any) => any;
  @Input('getParent')
  set getParent(getParent: (element: any) => any ) {
    this._getParent = getParent;
  }

  private _hasChildren: (element: any) => boolean;
  @Input('hasChildren')
  set hasChildren(hasChildren: (element: any) => boolean) {
    this._hasChildren = hasChildren;
  }

  private _getText: (element: any) => string;
  @Input('getText')
  set getText(getText: (element: any) => string) {
    this._getText = getText;
  }

  private _isFavorite: (element: any) => boolean;
  get isFavorite() {
    return this._isFavorite;
  }
  @Input('isFavorite')
  set isFavorite(isFavorite: (element: any) => boolean) {
    if(this._isFavorite === undefined) {
      this._isFavorite = (element: any) => {
        return false;
      }
    } else {
      this._isFavorite = isFavorite;
    }
  }

  private _maySelect: (element: any) => boolean = (element: any) => {
    return true;
  };
  get maySelect() {
    return this._maySelect;
  }
  @Input('maySelect')
  set maySelect(maySelect: (element: any) => boolean) {
    if (maySelect == null) {
      maySelect = (element: any) => {
        return true;
      };
    }

    this._maySelect = maySelect;
  }

  private _getIcon: (element: any) => string = (element: any) => {
    return '';
  };
  @Input('getIcon')
  set getIcon(getIcon: (element: any) => string) {
    if (getIcon == null) {
      getIcon = (element: any) => {
        return '';
      };
    }

    this._getIcon = getIcon;
  }

  private _selection: Array<any> = [];
  get selection() {
    return this._selection;
  }
  @Input('selection')
  set selection(selection: Array<any>) {
    if (selection == null) {
      selection = [];
    }

    this._selection = selection;

    for (let j: number = 0; j < this._selection.length; j++) {
      let selectionElementMapValue: ElementMapValue = this._elementMap.get(
        this._selection[j]);
      if (selectionElementMapValue) {
        let parentElementMapValue: ElementMapValue = this._elementMap.get(
          selectionElementMapValue.parent);
        while (parentElementMapValue) {
          parentElementMapValue.expanded = true;
          parentElementMapValue = this._elementMap.get(parentElementMapValue.
            parent);
        }
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  private _allowMultiselect: boolean = false;
  get allowMultiselect() {
    return this._allowMultiselect;
  }
  @Input('allowMultiselect')
  set allowMultiselect(allowMultiselect: boolean) {
    if (allowMultiselect == null) {
      allowMultiselect = false;
    }

    this._allowMultiselect = allowMultiselect;
  }

  private _actions: Array<Action> = [];
  get actions() {
    return this._actions;
  }
  @Input('actions')
  set actions(actions: Array<Action>) {
    if (actions == null) {
      actions = [];
    }

    this._actions = actions;
  }

  private _elementSelected: (element: any) => void = (element: any) => {
  };
  @Input('elementSelectionHandler')
  set elementSelected(elementSelected: (element: any) => void) {
    if (elementSelected == null) {
      elementSelected = (element: any) => {
      };
    }

    this._elementSelected = elementSelected;
  }

  private _elementSelectedEventEmitter: EventEmitter<any> =
    new EventEmitter<any>();
  @Output('elementSelected')
  get elementSelectedEventEmitter() {
    return this._elementSelectedEventEmitter;
  }

  private _quickSelectElements: Array<any> = [];
  get quickSelectElements() {
    return this._quickSelectElements;
  }
  @Input('quickSelectElements')
  set quickSelectElements(quickSelectElements: Array<any>) {
    if (quickSelectElements == null) {
      quickSelectElements = [];
    }

    this._quickSelectElements = quickSelectElements;
  }

  private _showSelections: boolean = false;
  get showSelections() {
    return this._showSelections;
  }
  @Input('showSelections')
  set showSelections(showSelections: boolean) {
    if (showSelections == null) {
      showSelections = false;
    }

    this._showSelections = showSelections;
  }

  private _searchTimeoutIdentifier: any;

  @ViewChild('elementContainer')
  private _elementContainer: any;

  get matDialogRef() {
    return this._matDialogRef;
  }

  get changeDetectorRef() {
    return this._changeDetectorRef;
  }

  get Array() {
    return Array;
  }

  public constructor (
                      private _changeDetectorRef: ChangeDetectorRef,
                      private treeService: TreeService,
                      private dialogService: DialogService,
                      @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
                      @Optional() private _matDialogRef: MatDialogRef<TreeComponent>
  ) {}

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.root = this._data['root'];
      this.getTitle = this._data['getTitle'];
      this.getChildren = this._data['getChildren'];
      this.hasChildren = this._data['hasChildren'];
      this.getParent = this._data['getParent'];
      this.getText = this._data['getText'];
      this.getIcon = this._data['getIcon'];
      this.isFavorite = this._data['isFavorite'];
      this.maySelect = this._data['maySelect'];
      this.selection = this._data['selection'];
      this.allowMultiselect = this._data['allowMultiselect'];
      this.actions = this._data['actions'];
      this.elementSelected = this._data['elementSelectionHandler'];
      this.quickSelectElements = this._data['quickSelectElements'];
      this.showSelections = this._data['showSelections'];
    }

    this.update(true);

    for (let j: number = 0; j < this._selection.length; j++) {
      let selectionElementMapValue: ElementMapValue = this._elementMap.get(
        this._selection[j]);
      if (selectionElementMapValue) {
        let parentElementMapValue: ElementMapValue = this._elementMap.get(
          selectionElementMapValue.parent);
        while (parentElementMapValue) {
          parentElementMapValue.expanded = true;
          parentElementMapValue = this._elementMap.get(parentElementMapValue.
            parent);
        }
      }
    }

    if(this.isDialogInstance()) {
      if(this.treeService.favorites.length > 0) {
        this.favorites = this.treeService.getFavorites();
        for(let i=0; i < this.favorites.length; i++) {
          this.addToFavorites(this.favorites[i]);
        }
        this.changeDetectorRef.detectChanges();
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * @see scrollElementIntoView
   *
   * controls nativeElement scroll focus
   */
  public ngAfterViewInit(): void {
    if (this._selection.length > 0) {
      this.scrollElementIntoView(this._selection[0]);
    }
  }

  /**
   * @see Dialog.interface.ts
   *
   * @param accept
   */
  public close(accept: boolean): any {
    return (accept ? this._selection : undefined);
  }

  public scrollElementIntoView(element: any): void {
    let selectionElementMapValue: ElementMapValue = this._elementMap.get(element);
    if (selectionElementMapValue) {
      let parentElementMapValue: ElementMapValue = this._elementMap.get(selectionElementMapValue.parent);
      while (parentElementMapValue) {
        parentElementMapValue.expanded = true;
        parentElementMapValue = this._elementMap.get(parentElementMapValue.parent);
      }

      let firstSelectedElementIndex: number = this.getDisplayedElements().indexOf(element);
      if (firstSelectedElementIndex !== -1) {
        // Each element row should be 40px or 36px tall.
        this._elementContainer.nativeElement.scrollTop = (((this._actions.length > 0) ? 40 : 36) * firstSelectedElementIndex);
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this._root = this._absoluteRoot;
      this.update(true);
      let selectionElementMapValue: ElementMapValue = this._elementMap.get(element);
      if(selectionElementMapValue) {
        let parentElementMapValue: ElementMapValue = this._elementMap.get(selectionElementMapValue.parent);
        while (parentElementMapValue) {
          parentElementMapValue.expanded = true;
          parentElementMapValue = this._elementMap.get(parentElementMapValue.parent);
        }

        let firstSelectedElementIndex: number = this.getDisplayedElements().indexOf(element);
        if (firstSelectedElementIndex !== -1) {
          // Each element row should be 40px or 36px tall.
          this._elementContainer.nativeElement.scrollTop = (((this._actions.length > 0) ? 40 : 36) * firstSelectedElementIndex);
          this._changeDetectorRef.markForCheck();
        }
      }
      this.update(true);
    }
  }

  public getDisplayedElements(): Array<any> {
    let displayedElements: Array<any> = [];
    let elements: Array<any> = Array.from(this._elementMap.keys());
    for (let j: number = 0; j < elements.length; j++) {
      if (this.shouldDisplay(elements[j])) {
        displayedElements.push(elements[j]);
      }
    }

    return displayedElements;
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance === this) && this._data;
  }

  _searchText: string = '';
  public searchTextChanged(searchText: string): void {
    if (this._searchTimeoutIdentifier) {
      clearTimeout(this._searchTimeoutIdentifier);
    }

    this._searchTimeoutIdentifier = setTimeout(() => {
      this._searchText = searchText;
      this.applySearchText();
      this._searchTimeoutIdentifier = undefined;
    }, 1100);
  }

  private applySearchText() {

    if (this._searchText) {
      let searchText = this._searchText.toLowerCase();
      let keys: Array<any> = Array.from(this._elementMap.keys());
      for (let j: number = 0; j < keys.length; j++) {
        let elementMapValue: ElementMapValue = this._elementMap.get(keys[j]);
        let matches: boolean = elementMapValue.text.toLowerCase().includes(searchText);
        elementMapValue.visible = matches;
        elementMapValue.expanded = false;
        if (matches) {
          if (elementMapValue.parent) {
            let parentElementMapValue: ElementMapValue = this._elementMap.get(elementMapValue.parent);
            while (parentElementMapValue) {
              parentElementMapValue.visible = true;
              parentElementMapValue.expanded = true;
              parentElementMapValue = this._elementMap.get(parentElementMapValue.parent);
            }
          }
        }
      }
    } else {
      let keys: Array<any> = Array.from(this._elementMap.keys());
      for (let j: number = 0; j < keys.length; j++) {
        let elementMapValue: ElementMapValue = this._elementMap.get(keys[j]);
        elementMapValue.visible = true;
        elementMapValue.expanded = false;
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  public getElementStyle(element: any): object {
    return {
      'padding-left': (this._elementMap.get(element).depth * 31) + 'px'
    };
  }

  public getExpansionIconStyle(element: any): object {
    return {
      'visibility': (!this.doesHaveChildren(element) ? 'hidden' : 'visible')
    };
  }

  public doesHaveChildren(element: any): boolean {
    if (this._hasChildren) {
      return this._hasChildren(element);
    } else {
      return (this._getChildren(element).length > 0);
    }
  }

  /**
   * Checks if the element should be shown in the mat-content-drawer tree
   *
   * @param element mat-content-drawer tree element
   *
   * @returns true or false
   */
  public shouldDisplay(element: any): boolean {
    let elementMapValue: ElementMapValue = this._elementMap.get(element);
    if(elementMapValue) {
      if (elementMapValue.visible) {
        let parent: any = elementMapValue.parent;
        if (parent === this._root || parent === '' || parent === this._absoluteRoot) {
          return true;
        } else {
          let elementExpanded = this._elementMap.get(parent).expanded;
          return elementExpanded;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }

  }

  public changeSingleExpansionState(element: any, expand: boolean): void {
    let elementMapValue: ElementMapValue = this._elementMap.get(element);
    elementMapValue.expanded = expand;
    if (!elementMapValue.expanded) {
      let descendantStack: Array<any> = [...this._getChildren(element)];
      while (descendantStack.length > 0) {
        let descendantElement: any = descendantStack.pop();
        let descendantElementMapValue: ElementMapValue = this._elementMap.get(
          descendantElement);
        descendantElementMapValue.expanded = false;
        descendantStack.push(...this._getChildren(descendantElement));
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  public changeAllExpansionStates(expand: boolean): void {
    let keys: Array<any> = Array.from(this._elementMap.keys());
    for (let j: number = 0; j < keys.length; j++) {
      let elementMapValue: ElementMapValue = this._elementMap.get(keys[j]);
      if (elementMapValue.visible) {
        elementMapValue.expanded = expand;
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  public changeSelectionOfAll(select: boolean): void {
    let keys: Array<any> = Array.from(this._elementMap.keys());
    for (let j: number = 0; j < keys.length; j++) {
      let elementMapValue: ElementMapValue = this._elementMap.get(keys[j]);
      if (elementMapValue.visible) {
        let elementIndex: number = this._selection.indexOf(keys[j]);
        if (select) {
          if (elementIndex === -1) {
            this._selection.push(keys[j]);
            this._elementSelected(keys[j]);
            this._elementSelectedEventEmitter.emit(keys[j]);
          }
        } else {
          if (elementIndex !== -1) {
            this._selection.splice(elementIndex, 1);
          }
        }
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  public getExpansionStates(): Map<any, boolean> {
    let expansionStates: Map<any, boolean> = new Map<any, boolean>();
    let elements: Array<any> = Array.from(this._elementMap.keys());
    for (let j: number = 0; j < elements.length; j++) {
      expansionStates.set(elements[j], this._elementMap.get(elements[j]).
        expanded);
    }

    return expansionStates;
  }

  public expandSelected(element: any) {
    let expansionStates: Map<any, boolean> = new Map<any, boolean>();
    let parentElement = element.parentProxy;

    if(parentElement) {

      while(parentElement) {
        let expansionState = this.elementMap.get(parentElement).expanded;
        expansionStates.set(parentElement, expansionState);
        parentElement = parentElement.parentProxy;
      }

      let keys: Array<any> = Array.from(expansionStates.keys());
      for (let j: number = 0; j < keys.length; j++) {
        let elementMapValue: ElementMapValue = this._elementMap.get(keys[j]);
        if (elementMapValue.visible) {
          elementMapValue.expanded = true;
        }
      }
      this.changeDetectorRef.detectChanges();
    }

    let firstSelectedElementIndex: number = this.getDisplayedElements().indexOf(element);
    if (firstSelectedElementIndex !== -1) {
      // Each element row should be 40px or 36px tall.
      this._elementContainer.nativeElement.scrollTop = (((this._actions.length > 0) ? 40 : 36) * firstSelectedElementIndex);
    }
    this._changeDetectorRef.detectChanges();
  }

  public setExpansionStates(expansionStateMap: Map<any, boolean>): void {
    let givenElements: Array<any> = Array.from(expansionStateMap.keys());
    for (let j: number = 0; j < givenElements.length; j++) {
      let elementMapValue: ElementMapValue = this._elementMap.get(givenElements[j]);
      if (elementMapValue) {
        elementMapValue.expanded = expansionStateMap.get(givenElements[j]);
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * updates the elementMap with a new root for values refresh and anchoring capability
   *
   * @param updateStructure set true to update the elementMap
   *
   */
  public update(updateStructure: boolean): void {
    if (updateStructure) {
      let expansionStates: Map<any, boolean> = this.getExpansionStates();
      this._elementMap.clear();
      let depth = 0;
      if (this.isDialogInstance()) {
        this.processElement(this._root, '', depth);
      } else {
        let children: Array<any> = this._getChildren(this._root);
        for (let j: number = 0; j < children.length; j++) {
          this.processElement(children[j], this._root, depth);
        }
      }

      this.setExpansionStates(expansionStates);
    }

    this.adjustElementArray();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Processes all system items and returns the elementMap with all relevant tree data
   *
   * @param element the element being processed
   * @param parent returns the element's parent
   * @param depth used to determine indentation (padding-left) in the tree
   */
  private processElement(element: any, parent: any, depth: number): void {
    this._elementMap.set(element, new ElementMapValue(
        parent,
        depth,
        this._getText(element),
        this._getIcon(element),
        this._isFavorite(element)
      ));

    let children: Array<any> = this._getChildren(element);
    for (let j: number = 0; j < children.length; j++) {
      this.processElement(children[j], element, depth + 1);
    }
  }

  public changeElementSelection(element: any): void {
    if (this._allowMultiselect) {
      let elementIndex: number = this._selection.indexOf(element);
      if (elementIndex === -1) {
        this._selection.push(element);
        this._elementSelected(element);
        this._elementSelectedEventEmitter.emit(element);
      } else {
        this._selection.splice(elementIndex, 1);
      }
    } else {
      this._selection.length = 0;
      this._selection.push(element);
      this._elementSelected(element);
      this._elementSelectedEventEmitter.emit(element);
    }
  }

  favorites: Array<any> = [];
  public addToFavorites(element: any) {
    let id = element.item.id;
    let quickSelectElementIndex = this.quickSelectElements.findIndex(t => t.item.id === id);
    let favoritesElementIndex = this.favorites.findIndex(t => t.item.id === id);
    let elementMapValue: ElementMapValue = this.elementMap.get(element);

    if(elementMapValue) {
      elementMapValue.favorite = true;
      try {
        // push element to the top of quickSelectElements
        if(quickSelectElementIndex === -1) {
          this._quickSelectElements.unshift(element);
        }
        if(favoritesElementIndex === -1) {
          this.favorites = this.treeService.addFavorite(element);
        }
      } catch (error) {
        console.log('!!! Add to Favorites Error: %s', error);
      }
    }

    this.changeDetectorRef.markForCheck();
  }

  public removeFromFavorites(element: any) {
    let id = element.item.id;
    let favoritesElementIndex = this.favorites.findIndex(t => t.item.id === id);
    let elementMapValue: ElementMapValue = this.elementMap.get(element);

    if(elementMapValue) {
      elementMapValue.favorite = false;
      try {
        if(favoritesElementIndex !== -1) {
          this.favorites = this.treeService.removeFavorite(element);
        }
      } catch (error) {
        console.log('!!! Remove from Favorites Error: %s', error);
      }
    }

    this.changeDetectorRef.markForCheck();
  }

  favored: boolean = false;
  getFavorite(element: any): boolean {
    let id = element.item.id;
    let favoritesElementIndex = this.favorites.findIndex(t => t.item.id === id);
    let elementMapValue: ElementMapValue = this.elementMap.get(element);

    if(favoritesElementIndex !== -1) {
      if(elementMapValue) {
        elementMapValue.favorite = true;
      }

      return this.changeDetectorRef.markForCheck(), this.favored = true;
    } else {
      if(elementMapValue) {
        elementMapValue.favorite = false;
      }

      return this.changeDetectorRef.markForCheck(), this.favored = false;
    }
  }

  elementArray: Array<ElementMapValue> = [];
  public processAnchoredElement(element: any) {
    this.elementArray.push(element);

    let children: Array<any> = this._getChildren(element);
    for (let j: number = 0; j < children.length; j++) {
      this.processAnchoredElement(children[j]);
    }

  }

  private adjustElementArray() {
    this.elementArray = [];
    this.processAnchoredElement(this.root);
  }

  public anchor(proxy: any) {
    this.root = proxy;
    this.adjustElementArray();
    this.applySearchText();
  }

  public upLevelRoot() {
    let parentElement = this._getParent(this.root);
    if(parentElement && (this.root !== this._absoluteRoot)) {
      this.root = parentElement;
      this.adjustElementArray();
      this.applySearchText();
    }
  }

  public returnToAbsoluteRoot() {
    if (this.root !== this._absoluteRoot) {
      this.root = this._absoluteRoot;
      this.adjustElementArray();
      this.applySearchText();
    }
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: itemProxy
      }
    }).updateSize('90%', '90%');
  }

  /**
   * @event Drag&Drop connected sorting group
   */
   drop(array: Array<any>, event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(array, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

}
