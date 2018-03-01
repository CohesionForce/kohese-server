import { Component, Optional, Inject, OnInit } from '@angular/core';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'icon-selector',
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.scss']
})
export class IconSelectorComponent implements OnInit{
  public selectedIcon: string;
  icons : Array<string>;
  
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private typeService: DynamicTypesService) {
  }

  ngOnInit() {
    this.icons = this.typeService.getIcons();
  }
  
  setIcon(icon: string): void {
    this.selectedIcon = icon;
  }
}