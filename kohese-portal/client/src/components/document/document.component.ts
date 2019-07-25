import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DocumentConfigurationEditorComponent } from '../object-editor/document-configuration/document-configuration-editor.component';
import { TextEditorComponent,
  FormatSpecification } from '../text-editor/text-editor.component';
import { AttributeInsertionSpecification,
  InsertionLocation } from '../text-editor/attribute-insertion/attribute-insertion.component';
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
  private _documentConfiguration: any;
  get documentConfiguration() {
    return this._documentConfiguration;
  }
  @Input('documentConfiguration')
  set documentConfiguration(documentConfiguration: any) {
    this._documentConfiguration = documentConfiguration;
    if (this._documentConfiguration) {
      this._document = (this._documentConfiguration.document ? this.
        _documentConfiguration.document : this.buildDocument());
      
      /* If the selected DocumentConfiguration has not been persisted, add it
      to the Array of DocumentConfigurations. */
      if (this._documentConfigurations.indexOf(this._documentConfiguration) ===
        -1) {
        this._documentConfigurations.unshift(this._documentConfiguration);
      }
      
      this._navigationService.navigate('Document', {
        id: this._documentConfiguration.id
      });
    } else {
      this._document = '';
    }
    
    if (this._textEditor && this._textEditor.editor && this._textEditor.editor.
      editor) {
      this._textEditor.editor.editor.undoManager.clear();
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  private _documentConfigurations: Array<any> = [];
  get documentConfigurations() {
    return this._documentConfigurations;
  }
  
  private _document: string = '';
  get document() {
    return this._document;
  }
  
  @ViewChild('textEditor')
  private _textEditor: TextEditorComponent;
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  private _treeConfigurationSubscription: Subscription;
  
  get Object() {
    return Object;
  }
  
  private static readonly _OPENING_HIDDEN_TAG: string =
    '<div id="" style="visibility: hidden;">\n\n';
  private static readonly _CLOSING_HIDDEN_TAG: string = '</div>\n\n';
  private static readonly _SEPARATOR_DIV_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;">\s{2}/g;
  private static readonly _INSERTED_ATTRIBUTE_REGEXP: RegExp =
    /<div id="[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[\s\S]+" style="visibility: hidden;">\s{2}/g;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<DocumentComponent>,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository, private _navigationService: NavigationService) {
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
            this.documentConfiguration = this._documentConfiguration;
          }
          break;
      }
    });
    
    if (this._documentConfiguration) {
      this.documentConfiguration = this._documentConfiguration;
    }
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
  
  private buildDocument(): string {
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
      
      document += this.getFormattedOpeningHiddenTag(itemProxy.item.id);
      
      document += this.getFormattedOpeningHiddenTag(itemProxy.item.id +
        'description');
      if (itemProxy.item.description) {
        document += (itemProxy.item.description + '\n\n');
      }
      document += DocumentComponent._CLOSING_HIDDEN_TAG;
      
      document += DocumentComponent._CLOSING_HIDDEN_TAG;
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
          let itemProxy: ItemProxy = await this._itemRepository.buildItem(
            'DocumentConfiguration', returnValue);
          if (!this._documentConfiguration) {
            this.documentConfiguration = itemProxy.item;
          }
          this._changeDetectorRef.markForCheck();
        } else {
          if (TreeConfiguration.getWorkingTree().getProxyFor(
            documentConfiguration.id).kind !== 'DocumentConfiguration') {
            // The edited DocumentConfiguration has not been persisted.
            delete documentConfiguration.id;
            documentConfiguration = (await this._itemRepository.buildItem(
              'DocumentConfiguration', documentConfiguration)).item;
          } else {
            await this._itemRepository.upsertItem(TreeConfiguration.
              getWorkingTree().getProxyFor(documentConfiguration.id));
          }
          this.documentConfiguration = documentConfiguration;
          this.populateDocumentConfigurationArray();
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
  
  public getFormattedTextFunction(): (text: string, formatSpecification:
    FormatSpecification) => string {
    /* The below function is passed to text-editor, so bind the correct 'this'
    to that function. */
    return ((text: string, formatSpecification: FormatSpecification) => {
      let formattedText: string = text;
      if (formatSpecification.attributeInsertionSpecification) {
        let insertionMap: Map<number, string> = new Map<number, string>();
        let match: any;
        let previousItemProxy: ItemProxy = undefined;
        while ((match = DocumentComponent._SEPARATOR_DIV_REGEXP.exec(
          formattedText)) != null) {
          let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(match[1]);
          let typeObject: any = formatSpecification.
            attributeInsertionSpecification.types[itemProxy.kind];
          if (typeObject) {
            if (formatSpecification.attributeInsertionSpecification.
              insertionLocation === InsertionLocation.Top) {
              insertionMap.set(match.index + match[0].length, this.
                getAttributeInsertionString(typeObject, itemProxy));
            } else {
              /* Insert the attribute string at the end of the content for the
              previous ItemProxy. */
              if (previousItemProxy) {
                // Subtract the length of '</div>\n\n'.
                insertionMap.set(match.index - 8, this.
                  getAttributeInsertionString(typeObject,
                  previousItemProxy));
              }
              
              /* If this is the last match, insert the attribute before the
              last '</div>\n\n'. */
              if (formattedText.substring(match.index + match[0].length).
                search(DocumentComponent._SEPARATOR_DIV_REGEXP) === -1) {
                // Subtract the length of '</div>\n\n'.
                insertionMap.set(formattedText.length - 8, this.
                  getAttributeInsertionString(typeObject, itemProxy));
              }
            }
          }
          
          previousItemProxy = itemProxy;
        }
        
        let insertionMapKeys: Array<number> = Array.from(insertionMap.keys());
        for (let j: number = (insertionMapKeys.length - 1); j >= 0; j--) {
          formattedText = formattedText.substring(0, insertionMapKeys[j]) +
            insertionMap.get(insertionMapKeys[j]) + formattedText.substring(
            insertionMapKeys[j]);
        }
      }
      
      if (formatSpecification.removeExternalFormatting) {
        // Remove the last '</div>\n\n'.
        let regExpTarget: string = formattedText.substring(0, formattedText.
          length - 8);
        let ids: Array<string> = [];
        // Reverse regExpTarget to remove inserted '</div>\n\n's in reverse.
        let document: string = regExpTarget.split('').reverse().join('');
        let match: any;
        while ((match = DocumentComponent._SEPARATOR_DIV_REGEXP.exec(
          regExpTarget)) != null) {
          ids.push(match[1]);
          if (match.index !== 0) {
            document = document.substring(0, (regExpTarget.length - match.
              index)) + document.substring(regExpTarget.length - match.index +
              8);
          }
        }
        // Re-orient document.
        document = document.split('').reverse().join('');
        document = document.replace(DocumentComponent._SEPARATOR_DIV_REGEXP,
          '');
        
        formattedText = document;
      }
      
      if (formatSpecification.updateSource) {
        this._document = formattedText;
        this._changeDetectorRef.markForCheck();
      }
      
      return formattedText;
    }).bind(this);
  }
  
  private getAttributeInsertionString(typeObject: any, itemProxy: ItemProxy):
    string {
    let attributeString: string = '';
    for (let attributeName in typeObject.attributes) {
      attributeString += this.getFormattedOpeningHiddenTag(itemProxy.item.id +
        attributeName);
      
      if (attributeName === 'name') {
        if (typeObject.attributes[attributeName].showAttributeName) {
          attributeString += attributeName + ': ';
        }

        if (typeObject.attributes[attributeName].linkToItem) {
          attributeString += '[' + itemProxy.item.name + '](' + window.
            location.origin + LocationMap['Explore'].route + ';id=' +
            itemProxy.item.id + ')\n\n';
        } else {
          attributeString += itemProxy.item.name + '\n\n';
        }
      } else {
        if (typeObject.attributes[attributeName].showAttributeName) {
          attributeString += attributeName + ': ';
        }

        let addition: string;
        let modelProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(itemProxy.model.item.classProperties[attributeName].
          definedInKind);
        if (modelProxy.item.properties[attributeName].relation) {
          let reference: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(itemProxy.item[attributeName]);
          if (reference) {
            addition = reference.item.name;
          } else {
            addition = itemProxy.item[attributeName];
          }
        } else {
          addition = itemProxy.item[attributeName];
        }

        attributeString += addition + '\n\n';
      }
      
      attributeString += DocumentComponent._CLOSING_HIDDEN_TAG;
    }
    
    return attributeString;
  }
  
  public getSaveFunction(): (text: string) => void {
    /* The below function is passed to text-editor, so bind the correct 'this'
    to that function. */
    return ((text: string) => {
      // Remove the last '</div>\n\n'.
      let regExpTarget: string = text.substring(0, text.length - 8);
      // Reverse regExpTarget to remove inserted '</div>\n\n's in reverse.
      let splitTarget: string = regExpTarget.split('').reverse().join('');
      let match: any;
      while ((match = DocumentComponent._SEPARATOR_DIV_REGEXP.exec(
        regExpTarget)) != null) {
        if (match.index !== 0) {
          splitTarget = splitTarget.substring(0, (regExpTarget.length - match.
            index)) + splitTarget.substring(regExpTarget.length - match.
            index + 8);
        }
      }
      // Re-orient splitTarget.
      splitTarget = splitTarget.split('').reverse().join('');
      
      let itemIdsAndContent: Array<string> = splitTarget.split(
        DocumentComponent._SEPARATOR_DIV_REGEXP);
      // Remove the first element, as it should be empty.
      itemIdsAndContent.shift();
      let documentMap: Map<string, string> = new Map<string, string>();
      for (let j: number = 0; j < itemIdsAndContent.length; j++) {
        if ((j % 2) === 0) {
          let itemId: string = itemIdsAndContent[j];
          let description: string = itemIdsAndContent[j + 1];
          let descriptionHiddenTag: string = this.getFormattedOpeningHiddenTag(
            itemId + 'description');
          // Remove non-description content
          description = description.substring(description.indexOf(
            descriptionHiddenTag) + descriptionHiddenTag.length);
          description = description.substring(0, description.search(
            DocumentComponent._INSERTED_ATTRIBUTE_REGEXP) - 8);
          
          documentMap.set(itemId, description);
        }
      }
      
      let componentIds: Array<string> = Object.keys(this.
        _documentConfiguration.components);
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
        let description: string = documentMap.get(documentIds[j]);
        if (description == null) {
          description = '';
        }
        
        // Don't save any Items whose description was not modified.
        if (itemProxy.item.description !== description) {
          itemProxy.item.description = description;
          this._itemRepository.upsertItem(itemProxy);
        }
      }
      
      this._documentConfiguration.document = text;
      
      // Only save the documentConfiguration if it has already been persisted
      if (TreeConfiguration.getWorkingTree().getProxyFor(this.
        _documentConfiguration.id).kind === 'DocumentConfiguration') {
        this._itemRepository.upsertItem(TreeConfiguration.getWorkingTree().
          getProxyFor(this._documentConfiguration.id));
      }
    }).bind(this);
  }
  
  private getFormattedOpeningHiddenTag(id: string): string {
    return DocumentComponent._OPENING_HIDDEN_TAG.substring(0, 9) + id +
      DocumentComponent._OPENING_HIDDEN_TAG.substring(9);
  }
}
