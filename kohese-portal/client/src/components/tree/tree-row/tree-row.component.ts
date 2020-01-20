import { Component, OnInit, Input, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';

import { TreeRow } from './tree-row.class';

@Component({
  selector: 'tree-row',
  templateUrl: './tree-row.component.html',
  styleUrls: ['./tree-row.component.scss'],
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

  public constructor(protected changeDetector: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this._treeRow.refresh = () => {
      this.changeDetector.markForCheck();
    };
  }

  public getIndentationStyle(): object {
    return {
      'padding-left': (this._treeRow.depth * 31) + 'px'
    };
  }
  
  public isActionGroup(displayableEntity: DisplayableEntity): boolean {
    return (displayableEntity instanceof ActionGroup);
  }
}

export class Image {
  public constructor(public path: string, public getText: (object:
    any) => string, public displayAsIcon: boolean, public display: (object:
    any) => boolean) {
  }
}

export class DisplayableEntity {
  protected constructor(public text: string, public description: string,
    public icon: string, public canActivate: (object: any) => boolean) {
  }
}

export class Action extends DisplayableEntity {
  public constructor(text: string, description: string, icon: string,
    canActivate: (object: any) => boolean, public perform: (object:
    any) => void) {
    super(text, description, icon, canActivate);
  }
}

export class ActionGroup extends DisplayableEntity {
  public constructor(text: string, description: string, icon: string,
    canActivate: (object: any) => boolean, public actions: Array<Action>) {
    super(text, description, icon, canActivate);
  }
}
