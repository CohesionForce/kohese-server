import { Component, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatStepper, MatDialogRef, MatAutocompleteSelectedEvent } from '@angular/material';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { UploadService } from '../../services/upload/upload.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'upload-image',
  templateUrl: './upload-image.component.html',
})

export class UploadImageComponent {
  selectedParent: ItemProxy;
  itemType: KoheseType;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private itemRepository: ItemRepository,
    private uploadService: UploadService,
// tslint:disable-next-line: no-shadowed-variable
    public MatDialogRef: MatDialogRef<UploadImageComponent>) {
  }


  public getSelectedImages(images: Array<File>): string {
    let names: Array<string> = [];
    for (let j: number = 0; j < images.length; j++) {
      names.push(images[j].name);
    }
    return names.join('\n');
  }

  public uploadFile(fileInput: any): void {
    let files: Array<File> = [];
    for (let j: number = 0; j < fileInput.files.length; j++) {
      console.log(fileInput.files[j]);
      if ((fileInput.files[j].type === 'image/png') || (fileInput.files[j].type ===
        'image/jpeg')) {
        files.push(fileInput.files[j]);
      }
    }
    console.log(files)
    if (files.length > 0) {
      this.uploadService.uploadFile(files, this.selectedParent.item.id);
    }
  }

  public onParentSelected(newParent): void {
    this.selectedParent = newParent;
  }
}
