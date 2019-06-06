import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input,
  Optional, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

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
  
  public constructor(private _parent: any, private _depth: number) {
  }
}

@Component({
  selector: 'tree',
  templateUrl: './tree.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeComponent implements OnInit {
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
  get getText() {
    return this._getText;
  }
  @Input('getText')
  set getText(getText: (element: any) => string) {
    this._getText = getText;
  }
  
  private _elementSelectedEventEmitter: EventEmitter<any> =
    new EventEmitter<any>();
  @Output('elementSelected')
  get elementSelectedEventEmitter() {
    return this._elementSelectedEventEmitter;
  }
  
  get Array() {
    return Array;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TreeComponent>) {
  }
  
  public ngOnInit(): void {
    if (this._data) {
      this._root = this._data['root'];
      this._getChildren = this._data['getChildren'];
      this._hasChildren = this._data['hasChildren'];
      this._getText = this._data['getText'];
    }
    
    this.update();
  }
  
  public searchTextChanged(searchText: string): void {
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
    let parent: any = this._elementMap.get(element).parent;
    if (parent === this._root) {
      return true;
    } else {
      return this._elementMap.get(parent).expanded;
    }
  }
  
  public expand(element: any): void {
    this._elementMap.get(element).expanded = true;
    this._changeDetectorRef.markForCheck();
  }
  
  public collapse(element: any): void {
    this._elementMap.get(element).expanded = false;
    this._changeDetectorRef.markForCheck();
  }
  
  public update(): void {
    this._elementMap.clear();
    let children: Array<any> = this._getChildren(this._root);
    for (let j: number = 0; j < children.length; j++) {
      this.processElement(children[j], this._root, 0);
    }
  }
  
  private processElement(element: any, parent: any, depth: number): void {
    this._elementMap.set(element, new ElementMapValue(parent, depth));
    
    let children: Array<any> = this._getChildren(element);
    for (let j: number = 0; j < children.length; j++) {
      this.processElement(children[j], element, depth + 1);
    }
  }
}
