import { Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import * as Uuid from 'uuid/v1';

import { DialogService,
  DialogComponent } from '../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository, RepoStates } from '../../services/item-repository/item-repository.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../common/src/KoheseModel';

import { BehaviorSubject ,  Subscription } from 'rxjs';

@Component({
  selector: 'type-editor',
  templateUrl: './type-editor.component.html',
  styleUrls: ['./type-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeEditorComponent implements OnInit, OnDestroy {
  public types: any;
  private _treeConfiguration: TreeConfiguration;
  private _koheseTypeStream: BehaviorSubject<KoheseType> =
    new BehaviorSubject<KoheseType>(undefined);
  get koheseTypeStream() {
    return this._koheseTypeStream;
  }

  /* Subscriptions */
  repoStatusSubscription : Subscription;
  private _treeConfigurationSubscription: Subscription;

  constructor(public typeService: DynamicTypesService,
    private dialogService: DialogService,
    private itemRepository: ItemRepository,
    private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update: any) => {
      switch (update.state) {
        case RepoStates.KOHESEMODELS_SYNCHRONIZED:
        case RepoStates.SYNCHRONIZATION_SUCCEEDED:
          this._treeConfigurationSubscription = this.itemRepository.
            getTreeConfig().subscribe(
            (treeConfiguration: TreeConfiguration) => {
            this._treeConfiguration = treeConfiguration;
            this.types = this.typeService.getKoheseTypes();
            delete this.types['KoheseModel'];
            delete this.types['KoheseView'];
            this._koheseTypeStream.next(this.types[Object.keys(this.
              types)[0]]);
            this._changeDetectorRef.markForCheck();
          });
      }
    });
  }

  ngOnDestroy(): void {
    if (this._treeConfigurationSubscription) {
      this._treeConfigurationSubscription.unsubscribe();
    }
    this.repoStatusSubscription.unsubscribe();
  }

  add(): void {
    this.dialogService.openInputDialog('Add Type', '', DialogComponent.
      INPUT_TYPES.TEXT, 'Name', '', undefined).afterClosed().subscribe((name:
      string) => {
      if (name) {
        let dataModelProxyPromise: Promise<ItemProxy> = this.itemRepository.
          upsertItem('KoheseModel', {
          name: name,
          parentId: 'Item',
          base: 'Item',
          idInjection: true,
          properties: {},
          validations: [],
          relations: {},
          acls: [],
          methods: [],
          localTypes: {}
        });
        let formatDefinitionId: string = (<any> Uuid).default();
        let viewModel: any = {
          name: name,
          modelName: name,
          parentId: 'view-item',
          icon: '',
          color: '#000000',
          localTypes: {},
          viewProperties: {},
          formatDefinitions: {},
          defaultFormatKey: formatDefinitionId,
          tableDefinitions: {}
        };
        viewModel.formatDefinitions[formatDefinitionId] = {
          'name': 'New definition',
          'header': {
            'kind': 'header',
            'contents': [
               {
                 'propertyName': {
                   kind: name,
                   attribute: 'name'
                 },
                 'hideLabel': false,
                 'labelOrientation': 'Top',
                 'kind': 'text'
               }
             ]
           },
          'containers': [
            {
              'kind': 'list',
              'contents': [
                {
                   'propertyName': {
                     kind: name,
                     attribute: 'description'
                   },
                   'hideLabel': false,
                   'labelOrientation': 'Top',
                   'kind': 'markdown'
                }
             ]
            }
          ],
          'id': formatDefinitionId
        };
        let viewModelProxyPromise: Promise<ItemProxy> = this.itemRepository.
          upsertItem('KoheseView', viewModel);

        Promise.all([dataModelProxyPromise, viewModelProxyPromise]).
          then((proxies: Array<ItemProxy>) => {
          this.typeService.buildKoheseType(proxies[0] as KoheseModel);
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }

  delete(): void {
    let koheseType: KoheseType = this._koheseTypeStream.getValue();
    this.dialogService.openYesNoDialog('Delete ' + koheseType.dataModelProxy.
      item.name, 'Are you sure that you want to delete ' + koheseType.
      dataModelProxy.item.name + '?').
      subscribe((choiceValue: any) => {
      if (choiceValue) {
        this.itemRepository.deleteItem(koheseType.dataModelProxy, false);
        this.itemRepository.deleteItem(koheseType.viewModelProxy, false);
        delete this.types[koheseType.dataModelProxy.item.name];
        this._changeDetectorRef.markForCheck();
      }
    });
  }
}
