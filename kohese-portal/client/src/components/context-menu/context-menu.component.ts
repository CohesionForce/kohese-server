import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild,  } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { any } from 'underscore';

export interface MenuItem {
  execute: () => void;
  isEnabled?: () => boolean;
  action: string;
  tooltip?: string;
  icon?: string;
}

@Component({
  selector: 'context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextMenuComponent {
  private _menuItems: MenuItem[];

  get menuItems() {
    return this._menuItems;
  }
  @Input('menuItems')
  set menuItems(menuItems: MenuItem[]) {
    this._menuItems = menuItems;
  }

  private _x: string;
  get x() {
    return this._x;
  }
  set x(x: string) {
    this._x = x;
    this._changeDetectorRef.markForCheck();
  }

  private _y: string;
  get y() {
    return this._y;
  }
  set y(y: string) {
    this._y = y;
    this._changeDetectorRef.markForCheck();
  }

  @ViewChild(MatMenuTrigger)
  private _contextMenu: MatMenuTrigger;
  get contextMenu() {
    return this._contextMenu;
  }

  constructor(private _changeDetectorRef: ChangeDetectorRef){}
}
