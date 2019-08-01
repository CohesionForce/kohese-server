import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DocumentConfigurationEditorComponent } from '../object-editor/document-configuration/document-configuration-editor.component';
import { TreeComponent } from '../tree/tree.component';
import { TextEditorComponent,
  FormatSpecification } from '../text-editor/text-editor.component';
import { AttributeInsertionSpecification,
  InsertionLocation } from '../text-editor/attribute-insertion/attribute-insertion.component';
import { ReportSpecificationComponent,
  ReportSpecifications } from '../reports/report-specification/report-specification.component';
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
      this._documentMap.clear();
      if (this._documentConfiguration.document) {
        this._document = this._documentConfiguration.document;
        this.textEditorContentChanged(this._document);
      } else {
        this._document = '';
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
          
          this._document += this.getFormattedOpeningHiddenTag(itemProxy.item.
            id, itemProxy.item.name, false);
          this._document += this.getFormattedOpeningHiddenTag(itemProxy.item.
            id + 'description', 'Description', false);
          
          this._documentMap.set(documentIds[j], itemProxy.item.description);
          if (itemProxy.item.description) {
            this._document += (itemProxy.item.description + '\n\n');
          }
          
          this._document += DocumentComponent._CLOSING_HIDDEN_TAG;
          
          this._document += DocumentComponent._CLOSING_HIDDEN_TAG;
        }
      }
      
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
  
  private _documentMap: Map<string, string> = new Map<string, string>();
  
  private _document: string = '';
  get document() {
    return this._document;
  }
  
  private _linkOutlineAndDocument: boolean = false;
  get linkOutlineAndDocument() {
    return this._linkOutlineAndDocument;
  }
  set linkOutlineAndDocument(linkOutlineAndDocument: boolean) {
    this._linkOutlineAndDocument = linkOutlineAndDocument;
  }
  
  private _getOutlineItemChildren: (element: any) => Array<any> = (element:
    any) => {
    let children: Array<any> = [];
    if (element === this._documentConfiguration) {
      let componentIds: Array<string> = Object.keys(this.
        _documentConfiguration.components);
      for (let j: number = 0; j < componentIds.length; j++) {
        children.push(TreeConfiguration.getWorkingTree().getProxyFor(
          componentIds[j]));
      }
    } else {
      children.push(...(element as ItemProxy).children);
    }
    
    return children;
  };
  get getOutlineItemChildren() {
    return this._getOutlineItemChildren;
  }
  
  private _getItemText: (element: any) => string = (element: any) => {
    return ((element as ItemProxy).item.name + (this._documentMap.get(
      (element as ItemProxy).item.id) === (element as ItemProxy).item.
      description ? '' : '*'));
  };
  get getItemText() {
    return this._getItemText;
  }
  
  @ViewChild('outlineTree')
  private _outlineTree: TreeComponent;
  
  @ViewChild('textEditor')
  private _textEditor: TextEditorComponent;
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  private _treeConfigurationSubscription: Subscription;
  
  get Object() {
    return Object;
  }
  
  private static readonly _INPUT_OPENING_HIDDEN_TAG: string =
    '<div id="" style="visibility: hidden;"><div id="delineator" class="mceNonEditable" style="color: lightgray; text-align: center; display: none;">------------------------</div>\n\n';
  private static readonly _OUTPUT_OPENING_HIDDEN_TAG: string =
    '<div id="" style="visibility: hidden;">\n\n<div id="delineator" class="mceNonEditable" style="color: lightgray; text-align: center; display: none;">\n\n\\------------------------\n\n</div>\n\n';
  private static readonly _CLOSING_HIDDEN_TAG: string = '</div>\n\n';
  private static readonly _SEPARATOR_DIV_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;">\s{2}<div id="[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}delineator" class="mceNonEditable" style="color: lightgray; text-align: center;[\s\S]*?">\s{2}\\-{12}[\s\S]+?-{12}\s{2}<\/div>\s{2}/g;
  private static readonly _ATTRIBUTE_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[\s\S]+)" style="visibility: hidden;">\s{2}<div id="[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}delineator" class="mceNonEditable" style="color: lightgray; text-align: center;[\s\S]*?">\s{2}\\-{12}[\s\S]+?-{12}\s{2}<\/div>\s{2}/g;
  
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
          let itemProxy: ItemProxy = await this._itemRepository.upsertItem(
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
            documentConfiguration = (await this._itemRepository.upsertItem(
              'DocumentConfiguration', documentConfiguration)).item;
          } else {
            let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
              getProxyFor(documentConfiguration.id);
            await this._itemRepository.upsertItem(itemProxy.kind, itemProxy.
              item);
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
  
  public scrollDocumentToItem(item: any): void {
    this._textEditor.editor.editor.dom.select('div#' + item.id)[0].
      scrollIntoView();
  }
  
  public isOutlineOpenAndLinked(): boolean {
    return (this._outlineTree && this._linkOutlineAndDocument);
  }
  
  public selectItemInOutline(node: any): void {
    let id: string;
    let startsWithSeparatorRegExp: RegExp =
      /^<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;"/;
    let match: any;
    do {
      if ((match = startsWithSeparatorRegExp.exec(node.outerHTML)) !== null) {
        id = match[1];
        break;
      }
      
      node = node.parentNode;
    } while (node);
    
    if (id) {
      this._outlineTree.selection = [TreeConfiguration.getWorkingTree().
        getProxyFor(id)];
      this._changeDetectorRef.markForCheck();
    }
  }
  
  public textEditorContentChanged(text: string): void {
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
    for (let j: number = 0; j < itemIdsAndContent.length; j++) {
      if ((j % 2) === 0) {
        let itemId: string = itemIdsAndContent[j];
        let description: string = itemIdsAndContent[j + 1];
        let descriptionHiddenTag: string = this.getFormattedOpeningHiddenTag(
          itemId + 'description', 'Description', true);
        // Remove non-description content
        description = description.substring(description.indexOf(
          descriptionHiddenTag) + descriptionHiddenTag.length);
        let nonDescriptionHiddenTagIndex: number = description.search(
          DocumentComponent._ATTRIBUTE_REGEXP);
        // Appropriately remove '</div>\n\n'.
        if (nonDescriptionHiddenTagIndex !== -1) {
          description = description.substring(0, nonDescriptionHiddenTagIndex -
            8);
        } else {
          description = description.substring(0, description.length - 8);
        }
        
        if (j !== (itemIdsAndContent.length - 2)) {
          // Trim off an extra '\n'.
          description = description.substring(0, description.length - 1);
        }
        
        this._documentMap.set(itemId, description);
        
        let element: any = this._textEditor.editor.editor.dom.select('div#' +
          itemId + 'delineator')[0];
        if (element) {
          let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(itemId);
          this._textEditor.editor.editor.dom.setHTML(element, '------------' +
            itemProxy.item.name + ((itemProxy.item.description ===
            description) ? '' : '*') + '------------');
        }
      }
    }
    
    if (this._outlineTree) {
      this._outlineTree.update(false);
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public getFormattedTextFunction(): (text: string, formatSpecification:
    FormatSpecification) => string {
    /* The below function is passed to text-editor, so bind the correct 'this'
    to that function. */
    return ((text: string, formatSpecification: FormatSpecification) => {
      return this.format(text, formatSpecification);
    }).bind(this);
  }
  
  private format(text: string, formatSpecification: FormatSpecification):
    string {
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
      
      formattedText = document;
    }
    
    if (formatSpecification.updateSource) {
      this._document = formattedText;
      
      if (formatSpecification.delineate !== undefined) {
        this._changeDetectorRef.detectChanges();
        
        let documentIds: Array<string> = Array.from(this._documentMap.keys());
        for (let j: number = 0; j < documentIds.length; j++) {
          let element: any = this._textEditor.editor.editor.dom.select('div#' +
            documentIds[j] + 'delineator')[0];
          if (element) {
            this._textEditor.editor.editor.dom.setStyle(element, 'display',
              (formatSpecification.delineate ? '' : 'none'));
          }
        }
      }
      
      this._changeDetectorRef.markForCheck();
    }
    
    return formattedText;
  }
  
  public getExportFunction(): (text: string) => void {
    return ((text: string) => {
      this._dialogService.openComponentDialog(
        ReportSpecificationComponent, {
        data: {
          defaultName: this._documentConfiguration.name + '_' + new Date().
            toISOString(),
          getReportContent: (initialContent: string, reportSpecifications:
            ReportSpecifications) => {
            return initialContent + this.format(text,
              new FormatSpecification());
          }
        },
        disableClose: true
      }).updateSize('40%', '40%');
    }).bind(this);
  }
  
  private getAttributeInsertionString(typeObject: any, itemProxy: ItemProxy):
    string {
    let attributeString: string = '';
    for (let attributeName in typeObject.attributes) {
      attributeString += this.getFormattedOpeningHiddenTag(itemProxy.item.id +
        attributeName, attributeName, false);
      
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
      this.textEditorContentChanged(text);
      let documentIds: Array<string> = Array.from(this._documentMap.keys());
      for (let j: number = 0; j < documentIds.length; j++) {
        let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(documentIds[j]);
        let description: string = this._documentMap.get(documentIds[j]);
        if (description == null) {
          description = '';
        }
        
        // Don't save any Items whose description was not modified.
        if (itemProxy.item.description !== description) {
          itemProxy.item.description = description;
          this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
        }
        
        let element: any = this._textEditor.editor.editor.dom.select('div#' +
          documentIds[j] + 'delineator')[0];
        if (element) {
          this._textEditor.editor.editor.dom.setHTML(element, '------------' +
            itemProxy.item.name + ((itemProxy.item.description ===
            description) ? '' : '*') + '------------');
        }
      }
      
      this._documentConfiguration.document = text;
      
      // Only save the documentConfiguration if it has already been persisted
      let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
        getProxyFor(this._documentConfiguration.id);
      if (itemProxy.kind === 'DocumentConfiguration') {
        this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
      }
      
      if (this._outlineTree) {
        this._outlineTree.update(false);
      }
    }).bind(this);
  }
  
  private getFormattedOpeningHiddenTag(id: string, text: string,
    inOutputFormat: boolean): string {
    let formattedOpeningHiddenTag: string;
    if (inOutputFormat) {
      // Insert id after 'id="'.
      formattedOpeningHiddenTag = (DocumentComponent.
        _OUTPUT_OPENING_HIDDEN_TAG.substring(0, 9) + id + DocumentComponent.
        _OUTPUT_OPENING_HIDDEN_TAG.substring(9, 50) + id + DocumentComponent.
        _OUTPUT_OPENING_HIDDEN_TAG.substring(50));
      
      // Insert text in the middle of the 24 '-'s.
      formattedOpeningHiddenTag = formattedOpeningHiddenTag.substring(0,
        formattedOpeningHiddenTag.length - 22) + text +
        formattedOpeningHiddenTag.substring(formattedOpeningHiddenTag.length -
        22);
    } else {
      // Insert id after 'id="'.
      formattedOpeningHiddenTag = (DocumentComponent.
        _INPUT_OPENING_HIDDEN_TAG.substring(0, 9) + id + DocumentComponent.
        _INPUT_OPENING_HIDDEN_TAG.substring(9, 48) + id + DocumentComponent.
        _INPUT_OPENING_HIDDEN_TAG.substring(48));
      
      // Insert text in the middle of the 24 '-'s.
      formattedOpeningHiddenTag = formattedOpeningHiddenTag.substring(0,
        formattedOpeningHiddenTag.length - 20) + text +
        formattedOpeningHiddenTag.substring(formattedOpeningHiddenTag.length -
        20);
    }
    
    return formattedOpeningHiddenTag;
  }
}
