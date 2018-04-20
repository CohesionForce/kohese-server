import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'type-overview',
  templateUrl: './type-overview.component.html'
})
export class TypeOverviewComponent implements OnInit, OnChanges {
  @Input()
  public type: KoheseType;
  public filteredTypes: any;
  private initialized: boolean = false;
  
  constructor(private dialogService: DialogService,
    private typeService: DynamicTypesService) {
  }
  
  ngOnInit(): void {
    this.refresh();
    this.initialized = true;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      if (changes['type']) {
        this.type = changes['type'].currentValue;
        this.refresh();
      }
    }
  }
  
  refresh(): void {
    this.filteredTypes = {};
    let types: any = this.typeService.getKoheseTypes();
    for (let typeName in types) {
      if (this.type.dataModelProxy.item.name !== typeName) {
        this.filteredTypes[typeName] = types[typeName];
      }
    }
  }
  
  openIconSelectionDialog(): void {
    this.dialogService.openComponentDialog(IconSelectorComponent, {}).
      afterClosed().subscribe((result: string) => {
      if ('\0' !== result) {
        this.type.viewModelProxy.item.icon = result;
      }
    });
  }
}