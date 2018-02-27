import { Injectable, Input } from '@angular/core';
import { NavigatableComponent } from './NavigationComponent.class';
import { NavigationService } from '../services/navigation/navigation.service';

import { ItemProxy } from '../../../common/models/item-proxy.js';

export class RowComponent extends NavigatableComponent {
  @Input()
  public itemProxy: ItemProxy;
  public visible: boolean = true;
  public selected: boolean = false;

  constructor (protected NavigationService : NavigationService) {
    super (NavigationService);
  }

  getProxy(): ItemProxy {
    return this.itemProxy;
  }
  
  isVisible(): boolean {
    return this.visible;
  }

  setVisible(show: boolean): void {
    this.visible = show;
  }
  
  setSelected(select: boolean): void {
    this.selected = select;
  }
}
