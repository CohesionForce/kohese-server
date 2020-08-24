import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  Optional, Inject, OnInit, Output, EventEmitter, ViewChild,
  AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Dialog } from '../dialog/Dialog.interface';

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
  
  public constructor(private _parent: any, private _depth: number,
    private _text: string, private _icon: string) {
  }
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
  
  public constructor(private _tooltip: string, private _classes: string,
    private _isVisible: (element: any) => boolean, private _canExecute:
    (element: any) => boolean, private _execute: (element: any) => void) {
  }
}

export class ToggleAction extends Action {
  get isSelected() {
    return this._isSelected;
  }
  
  public constructor(tooltip: string, classes: string, isVisible: (element:
    any) => boolean, canExecute: (element: any) => boolean,
    private _isSelected: (element: any) => boolean, execute: (element:
    any) => void) {
    super(tooltip, classes, isVisible, canExecute, execute);
  }
}

export enum TreeComponentConfiguration {
  GET_CHILDREN, HAS_CHILDREN, GET_TEXT, GET_ICON, MAY_SELECT,
    ELEMENT_SELECTION_HANDLER
}

@Component({
  selector: 'tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent implements OnInit, AfterViewInit, Dialog {
  private _elementMap: Map<any, ElementMapValue> =
    new Map<any, ElementMapValue>();
  get elementMap() {
    return this._elementMap;
  }
  
  private _root: any;
  @Input('root')
  set root(root: any) {
    this._root = root;
  }
  
  private _getChildren: (element: any) => Array<any>;
  get getChildren() {
    return this._getChildren;
  }
  @Input('getChildren')
  set getChildren(getChildren: (element: any) => Array<any>) {
    this._getChildren = getChildren;
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
  
  get Array() {
    return Array;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TreeComponent>) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.root = this._data['root'];
      this.getChildren = this._data['getChildren'];
      this.hasChildren = this._data['hasChildren'];
      this.getText = this._data['getText'];
      this.getIcon = this._data['getIcon'];
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
    
    this._changeDetectorRef.markForCheck();
  }
  
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
    let selectionElementMapValue: ElementMapValue = this._elementMap.get(
      element);
    if (selectionElementMapValue) {
      let parentElementMapValue: ElementMapValue = this._elementMap.get(
        selectionElementMapValue.parent);
      while (parentElementMapValue) {
        parentElementMapValue.expanded = true;
        parentElementMapValue = this._elementMap.get(parentElementMapValue.
          parent);
      }
      
      let firstSelectedElementIndex: number = this.getDisplayedElements().
        indexOf(element);
      if (firstSelectedElementIndex !== -1) {
        // Each element row should be 40px or 36px tall.
        this._elementContainer.nativeElement.scrollTop = (((this._actions.
          length > 0) ? 40 : 36) * firstSelectedElementIndex);
        this._changeDetectorRef.markForCheck();
      }
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
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  public searchTextChanged(searchText: string): void {
    if (this._searchTimeoutIdentifier) {
      clearTimeout(this._searchTimeoutIdentifier);
    }
    
    this._searchTimeoutIdentifier = setTimeout(() => {
      if (searchText) {
        searchText = searchText.toLowerCase();
        let keys: Array<any> = Array.from(this._elementMap.keys());
        for (let j: number = 0; j < keys.length; j++) {
          let elementMapValue: ElementMapValue = this._elementMap.get(keys[j]);
          let matches: boolean = elementMapValue.text.toLowerCase().includes(
            searchText);
          elementMapValue.visible = matches;
          elementMapValue.expanded = false;
          if (matches) {
            if (elementMapValue.parent) {
              let parentElementMapValue: ElementMapValue = this._elementMap.get(
                elementMapValue.parent);
              while (parentElementMapValue) {
                parentElementMapValue.visible = true;
                parentElementMapValue.expanded = true;
                parentElementMapValue = this._elementMap.get(
                  parentElementMapValue.parent);
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
      this._searchTimeoutIdentifier = undefined;
    }, 700);
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
  
  public shouldDisplay(element: any): boolean {
    let elementMapValue: ElementMapValue = this._elementMap.get(element);
    if (elementMapValue.visible) {
      let parent: any = elementMapValue.parent;
      if (parent === this._root) {
        return true;
      } else {
        return this._elementMap.get(parent).expanded;
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
  
  public setExpansionStates(expansionStateMap: Map<any, boolean>): void {
    let givenElements: Array<any> = Array.from(expansionStateMap.keys());
    for (let j: number = 0; j < givenElements.length; j++) {
      let elementMapValue: ElementMapValue = this._elementMap.get(
        givenElements[j]);
      if (elementMapValue) {
        elementMapValue.expanded = expansionStateMap.get(givenElements[j]);
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public getTreePath(element: any): Array<any> {
    let treePath: Array<any> = [];
    let elementMapValue: ElementMapValue = this._elementMap.get(element);
    if (elementMapValue) {
      treePath.unshift(element);
      
      if (elementMapValue.depth > 0) {
        let elements: Array<any> = Array.from(this._elementMap.keys());
        let beginningIndex: number = elements.indexOf(element);
        for (let j: number = beginningIndex - 1; j >= 0; j--) {
          let previousElementMapValue: ElementMapValue = this._elementMap.get(
            elements[j]);
          if (previousElementMapValue.depth === (elementMapValue.depth - 1)) {
            treePath.unshift(elements[j]);
            if (previousElementMapValue.depth === 0) {
              break;
            }
            elementMapValue = previousElementMapValue;
          }
        }
      }
    }
    
    return treePath;
  }
  
  public update(updateStructure: boolean): void {
    if (updateStructure) {
      let expansionStates: Map<any, boolean> = this.getExpansionStates();
      this._elementMap.clear();
      let children: Array<any> = this._getChildren(this._root);
      for (let j: number = 0; j < children.length; j++) {
        this.processElement(children[j], this._root, 0);
      }
      
      this.setExpansionStates(expansionStates);
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  private processElement(element: any, parent: any, depth: number): void {
    this._elementMap.set(element, new ElementMapValue(parent, depth, this.
      _getText(element), this._getIcon(element)));
    
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
}
