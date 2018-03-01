import { Component, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ImportService } from '../../../services/import/import.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'import',
  templateUrl: './import.component.html'
})
export class ImportComponent {
  itemType : KoheseType;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private itemRepository: ItemRepository,
    private typeService: DynamicTypesService,
    private importService : ImportService) {
      this.itemType = typeService.getKoheseTypes['Item'];
  }

  filter(fieldName: string): boolean {
    return (fieldName === 'parentId');
  }

  getSelectedFilenames(files: Array<File>): string {
    let names: Array<string> = [];
    for (let j: number = 0; j < files.length; j++) {
      names.push(files[j].name);
    }

    return names.join('\n');
  }

  importFile (fileInput, userInput) {
    this.importService.importFile(fileInput.files, 
                                  userInput.getFormGroup().value.parentId)
  }
}
