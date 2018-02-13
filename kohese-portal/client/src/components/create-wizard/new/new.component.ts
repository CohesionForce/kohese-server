import { Component, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

@Component({
  selector: 'new',
  templateUrl: 'new.component.html'
})
export class NewComponent implements OnInit, OnDestroy {
  private selectedType: KoheseType;
  
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private typeService: DynamicTypesService,
    private itemRepository: ItemRepository) {
  }
  
  ngOnInit(): void {
    this.selectedType = this.typeService.getKoheseTypes()['Item'];
  }
  
  ngOnDestroy(): void {
  }
  
  build(item: any): void {
    this.itemRepository.createItem(this.selectedType.name, item);
  }
}