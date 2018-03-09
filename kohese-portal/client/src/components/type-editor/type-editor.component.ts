import { Component, OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

@Component({
  selector: 'type-editor',
  templateUrl: './type-editor.component.html',
  styleUrls: ['./type-editor.component.scss']
})
export class TypeEditorComponent implements OnInit {
  public types: any;
  public selectedType: KoheseType;
  
  constructor(public typeService: DynamicTypesService,
    private dialogService: DialogService,
    private itemRepository: ItemRepository) {
  }
  
  ngOnInit(): void {
    this.types = this.typeService.getKoheseTypes();
    this.selectedType = this.types[Object.keys(this.types)[0]];
  }
  
  add(): void {
    this.dialogService.openInputDialog('Add Type', '', this.dialogService.
      INPUT_TYPES.TEXT, 'Name').afterClosed().subscribe((name: string) => {
      if (name) {
        let dataModelProxyPromise: Promise<ItemProxy> = this.itemRepository.
          buildItem('KoheseModel', {
          name: name,
          base: '',
          idInjection: true,
          properties: {},
          validations: [],
          relations: {},
          acls: [],
          methods: []
        });
        let viewModelProxyPromise: Promise<ItemProxy> = this.itemRepository.
          buildItem('KoheseView', {
          name: name,
          modelName: name,
          viewProperties: {}
        });
      
        Promise.all([dataModelProxyPromise, viewModelProxyPromise]).
          then((proxies: Array<ItemProxy>) => {
          this.types[name] = new KoheseType(proxies[0], proxies[1]);
        });
      }
    });
  }
  
  save(): void {
    this.itemRepository.upsertItem(this.selectedType.synchronizeDataModel()).
      catch((error: any) => {
      console.log('Error saving data model for ' + this.selectedType.name
        + '.');
      console.log(error);
    });
    this.itemRepository.upsertItem(this.selectedType.synchronizeViewModel()).
      catch((error: any) => {
      console.log('Error saving view model for ' + this.selectedType.name
        + '.');
      console.log(error);
    });
  }
  
  delete(): void {
    this.dialogService.openYesNoDialog('Delete ' + this.selectedType.name,
      'Are you sure that you want to delete ' + this.selectedType.name + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        this.itemRepository.deleteItem(this.selectedType.synchronizeDataModel(), false);
        this.itemRepository.deleteItem(this.selectedType.synchronizeViewModel(), false);
        delete this.types[this.selectedType.name];
      }
    });
  }
}