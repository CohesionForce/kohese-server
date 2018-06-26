import { EventEmitter, Output } from '@angular/core';
import { Component, OnInit, Input, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';

import { TreeRow } from './tree-row.class';

@Component({
  selector: 'tree-row',
  templateUrl: './tree-row.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeRowComponent implements OnInit {

  private _treeRow: TreeRow;
  get treeRow() {
    return this._treeRow;
  }
  @Input('treeRow')
  set treeRow(treeRow: TreeRow) {
    this._treeRow = treeRow;
  }

  private _images: Array<Image> = [];
  get images() {
    return this._images;
  }
  @Input('images')
  set images(images: Array<Image>) {
    this._images = images;
  }

  private _rowActions: Array<Action> = [];
  get rowActions() {
    return this._rowActions;
  }
  @Input('rowActions')
  set rowActions(rowActions: Array<Action>) {
    this._rowActions = rowActions;
  }

  private _menuActions: Array<Action> = [];
  get menuActions() {
    return this._menuActions;
  }
  @Input('menuActions')
  set menuActions(menuActions: Array<Action>) {
    this._menuActions = menuActions;
  }

  public constructor(private _changeDetector: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this._treeRow.refresh = () => {
      this._changeDetector.markForCheck();
    };
  }

  public getIndentationStyle(): object {
    return {
      'padding-left': (this._treeRow.depth * 15) + 'px'
    };
  }
}

export class Image {
  public constructor(public path: string, public text: string,
    public displayAsIcon: boolean, public display: (row: TreeRow) => boolean) {
  }
}

class Action {
  public constructor(public name: string, public description: string,
    public icon: string, public perform: (row: TreeRow) => void) {
  }
}

export class RowAction extends Action {
  public constructor(name: string, description: string, icon: string,
    public show: (row: TreeRow) => boolean, perform: (row:
    TreeRow) => void) {
    super(name, description, icon, perform);
  }
}

export class MenuAction extends Action {
  public constructor(name: string, description: string, icon: string,
    public enable: (row: TreeRow) => boolean, perform: (row:
    TreeRow) => void) {
    super(name, description, icon, perform);
  }
}
