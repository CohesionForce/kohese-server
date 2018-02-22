import { Component, Optional, Inject } from '@angular/core';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'icon-selector',
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.scss']
})
export class IconSelectorComponent {
  public selectedIcon: string;
  
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    public typeService: DynamicTypesService) {
  }
  
  setIcon(icon: string): void {
    this.selectedIcon = icon;
  }
}