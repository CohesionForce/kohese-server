import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import * as ItemProxy from '../../../../common/src/item-proxy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'type-editor',
  templateUrl: './type-editor.component.html',
  styleUrls: ['./type-editor.component.scss']
})
export class TypeEditorComponent implements OnInit, OnDestroy {
  public types: any;
  public selectedType: KoheseType;
  private _treeConfiguration: ItemProxy.TreeConfiguration;
  
  /* Subscriptions */
  repoStatusSubscription : Subscription;
  private _treeConfigurationSubscription: Subscription;
  
  constructor(public typeService: DynamicTypesService,
    private dialogService: DialogService,
    private itemRepository: ItemRepository) {
  }
  
  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
    .subscribe((update: any) => {
      switch (update.state){
        case RepoStates.KOHESEMODELS_SYNCHRONIZED:
        case RepoStates.SYNCHRONIZATION_SUCCEEDED:
          this._treeConfigurationSubscription = this.itemRepository.
            getTreeConfig().subscribe(
            (treeConfiguration: ItemProxy.TreeConfiguration) => {
            this._treeConfiguration = treeConfiguration;
            this.types = this.typeService.getKoheseTypes();
            this.selectedType = this.types[Object.keys(this.types)[0]];
          });
      }
  })
  }

  ngOnDestroy(): void {
    if (this._treeConfigurationSubscription) {
      this._treeConfigurationSubscription.unsubscribe();
    }
    this.repoStatusSubscription.unsubscribe();
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
          let viewModelProxyMap: any = {};
          let modelProxy: ItemProxy = proxies[0];
          do {
            viewModelProxyMap[modelProxy.item.id] = this._treeConfiguration.
              getProxyFor('view-' + modelProxy.item.name);
            modelProxy = modelProxy.parentProxy;
          } while (modelProxy.item.base)
          this.types[name] = new KoheseType(proxies[0], viewModelProxyMap);
        });
      }
    });
  }
  
  save(): void {
    this.selectedType.synchronizeModels();
    this.itemRepository.upsertItem(this.selectedType.dataModelProxy).
      catch((error: any) => {
      console.log('Error saving data model for ' + this.selectedType.
        dataModelProxy.item.name + '.');
      console.log(error);
    });
    this.itemRepository.upsertItem(this.selectedType.viewModelProxy).
      catch((error: any) => {
      console.log('Error saving view model for ' + this.selectedType.
        dataModelProxy.item.name + '.');
      console.log(error);
    });
  }
  
  delete(): void {
    this.dialogService.openYesNoDialog('Delete ' + this.selectedType.
      dataModelProxy.item.name, 'Are you sure that you want to delete ' + this.
      selectedType.dataModelProxy.item.name + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        this.itemRepository.deleteItem(this.selectedType.dataModelProxy, false);
        this.itemRepository.deleteItem(this.selectedType.viewModelProxy, false);
        delete this.types[this.selectedType.dataModelProxy.item.name];
      }
    });
  }
}