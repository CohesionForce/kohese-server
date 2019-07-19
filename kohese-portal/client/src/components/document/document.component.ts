import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DocumentConfigurationEditorComponent } from '../object-editor/document-configuration/document-configuration-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { LocationMap } from '../../constants/LocationMap.data';

@Component({
  selector: 'document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentComponent implements OnInit, OnDestroy {
  // To-do: allow setting via route
  private _documentConfiguration: any;
  get documentConfiguration() {
    return this._documentConfiguration;
  }
  @Input('documentConfiguration')
  set documentConfiguration(documentConfiguration: any) {
    this._documentConfiguration = documentConfiguration;
  }
  
  private _documentConfigurations: Array<any> = [];
  get documentConfigurations() {
    return this._documentConfigurations;
  }
  
  private _document: string = '';
  get document() {
    return this._document;
  }
  
  private _updatedDocument: string;
  get updatedDocument() {
    return this._updatedDocument;
  }
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  private _treeConfigurationSubscription: Subscription;
  
  get Object() {
    return Object;
  }
  
  private static readonly _SEPARATOR_DIV_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;">\s{2}/g;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<DocumentComponent>,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository) {
  }
  
  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._documentConfiguration = this._data['documentConfiguration'];
    }
    
    this.populateDocumentConfigurationArray();
    
    this._treeConfigurationSubscription = TreeConfiguration.getWorkingTree().
      getChangeSubject().subscribe((notification: any) => {
      switch (notification.type) {
        case 'create':
        case 'delete':
        case 'loaded':
          this.populateDocumentConfigurationArray();
          
          if ((notification.type === 'loaded') && this.
            _documentConfiguration) {
            this.documentConfigurationSelected(this._documentConfiguration);
          }
          break;
      }
    });
  }
  
  public ngOnDestroy(): void {
    this._treeConfigurationSubscription.unsubscribe();
  }
  
  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }
  
  private populateDocumentConfigurationArray(): void {
    this._documentConfigurations.length = 0;
    TreeConfiguration.getWorkingTree().getRootProxy().visitTree(undefined,
      (itemProxy: ItemProxy) => {
      if (itemProxy.kind === 'DocumentConfiguration') {
        this._documentConfigurations.push(itemProxy.item);
      }
    }, undefined);
  }
  
  public documentConfigurationSelected(documentConfiguration: any): void {
    this._documentConfiguration = documentConfiguration;
    this._document = this.buildDocument(true);
    this._changeDetectorRef.markForCheck();
  }
  
  public buildDocument(delineateItems: boolean): string {
    let document: string = '';
    let componentIds: Array<string> = Object.keys(this._documentConfiguration.
      components);
    let documentIds: Array<string> = [];
    for (let j: number = 0; j < componentIds.length; j++) {
      documentIds.push(componentIds[j]);
      let componentSettings: any = this._documentConfiguration.components[
        componentIds[j]];
      if (componentSettings.includeDescendants) {
        let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(componentIds[j]);
        itemProxy.visitTree({ includeOrigin: false }, (descendantItemProxy:
          ItemProxy) => {
          documentIds.push(descendantItemProxy.item.id);
        });
      }
    }
    
    for (let j: number = 0; j < documentIds.length; j++) {
      let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
        getProxyFor(documentIds[j]);
      
      if (delineateItems) {
        document += ('<div id="' + itemProxy.item.id +
          '" style="visibility: hidden;">\n\n');
      }
      
      if (itemProxy.item.description) {
        document += itemProxy.item.description;
      }
      if (j < (documentIds[j].length - 1)) {
        document += '\n\n';
      }
      
      if (delineateItems) {
        document += '</div>\n\n';
      }
    }
    
    return document;
  }
  
  public editDocumentConfiguration(documentConfiguration: any):
    void {
    this._dialogService.openComponentDialog(
      DocumentConfigurationEditorComponent, {
      data: {
        documentConfiguration: (documentConfiguration ? documentConfiguration :
          undefined)
      }
    }).updateSize('90%', '90%').afterClosed().subscribe(async (returnValue:
      any) => {
      if (returnValue) {
        if (!documentConfiguration) {
          await this._itemRepository.buildItem('DocumentConfiguration',
            returnValue);
          this._changeDetectorRef.markForCheck();
        } else {
          await this._itemRepository.upsertItem(TreeConfiguration.
            getWorkingTree().getProxyFor(documentConfiguration.id));
          this.populateDocumentConfigurationArray();
          this.documentConfigurationSelected(documentConfiguration);
          this._changeDetectorRef.markForCheck();
        }
      }
    });
  }

  public removeSelectedDocumentConfiguration(): void {
    this._dialogService.openYesNoDialog('Remove ' + this.
      _documentConfiguration.name, 'Are you sure that you want to ' +
      'remove ' + this._documentConfiguration.name + '?').subscribe(
      async (result: any) => {
      if (result) {
        await this._itemRepository.deleteItem(TreeConfiguration.
          getWorkingTree().getProxyFor(this._documentConfiguration.id),
          false);
        this._documentConfigurations.splice(this._documentConfigurations.
          indexOf(this._documentConfiguration), 1);
        this._documentConfiguration = undefined;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public storeUpdatedDocument(updatedDocument: string): void {
    this._updatedDocument = updatedDocument;
    this._changeDetectorRef.markForCheck();
  }
  
  public getUnifiedDocumentFunction(): (text: string) => string {
    /* The below function is passed to text-editor, so bind the correct 'this'
    to that function. */
    return ((text: string) => {
      return this.buildDocument(false);
    }).bind(this);
  }
  
  public save(): void {
    // Remove the last '</div>' and two '\n's.
    let regExpTarget: string = this._updatedDocument.substring(0, this.
      _updatedDocument.length - 8);
    /* Reverse regExpTarget to prevent match indices from being incorrect on
    matches after the first. */
    let splitTarget: string = regExpTarget.split('').reverse().join('');
    let ids: Array<string> = [];
    let match: any;
    // Remove all other '</div>'s and two '\n's for each.
    while ((match = DocumentComponent._SEPARATOR_DIV_REGEXP.exec(
      regExpTarget)) != null) {
      ids.push(match[1]);
      if (match.index !== 0) {
        splitTarget = splitTarget.substring(0, (splitTarget.length - match.
          index + 1)) + splitTarget.substring(splitTarget.length - match.
          index + 9);
      }
    }
    // Re-orient splitTarget.
    splitTarget = splitTarget.split('').reverse().join('');
    let descriptions: Array<string> = splitTarget.split(DocumentComponent.
      _SEPARATOR_DIV_REGEXP);
    /* Remove the first element, as it should be empty, and every odd-indexed
    element, as it should be a capture group. */
    descriptions = descriptions.filter((element: string) => {
      let index: number = descriptions.indexOf(element);
      if ((index !== 0) && ((index % 2) === 0)) {
        return element;
      }
    });
    
    for (let componentId in this._documentConfiguration.components) {
      let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
        getProxyFor(componentId);
      let idIndex: number = ids.indexOf(itemProxy.item.id);
      if (idIndex === -1) {
        itemProxy.item.description = '';
      } else {
        // Don't save any Items whose description was not modified.
        if (itemProxy.item.description !== descriptions[idIndex]) {
          itemProxy.item.description = descriptions[idIndex];
          this._itemRepository.upsertItem(itemProxy);
        }
      }
    }
  }
}
