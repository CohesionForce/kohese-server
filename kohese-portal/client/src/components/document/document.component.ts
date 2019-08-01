import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DocumentConfigurationEditorComponent } from '../object-editor/document-configuration/document-configuration-editor.component';
import { TreeComponent } from '../tree/tree.component';
import { TextEditorComponent } from '../text-editor/text-editor.component';
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
      this._document = this.buildDocument();
      
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
  
  private _getOutlineItemText: (element: any) => string = (element: any) => {
    return (element as ItemProxy).item.name;
  };
  get getOutlineItemText() {
    return this._getOutlineItemText;
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
  
  private static readonly _SEPARATOR_DIV_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;">\s{2}/g;
  
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
      
      document += ('<div id="' + itemProxy.item.id +
        '" style="visibility: hidden;">\n\n');
      
      if (itemProxy.item.description) {
        document += itemProxy.item.description;
      }
      if (j < (documentIds.length - 1)) {
        document += '\n\n';
      }
      
      document += '</div>\n\n';
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
  
  public scrollDocumentToItem(item: any): void {
    this._textEditor.editor.editor.dom.select('div#' + item.id)[0].
      scrollIntoView();
  }
  
  public isOutlineOpenAndLinked(): boolean {
    return (this._outlineTree && this._linkOutlineAndDocument);
  }
  
  public selectItemInOutline(node: any): void {
    let id: string;
    // Reuse _SEPARATOR_DIV_REGEXP, trimming off '>\s{2}'.
    let separatorDivRegExpSource: string = DocumentComponent.
      _SEPARATOR_DIV_REGEXP.source;
    let startsWithSeparatorRegExp: RegExp = new RegExp('^' +
      separatorDivRegExpSource.substring(0, separatorDivRegExpSource.length -
      6));
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
  
  public getUnifiedDocumentFunction(): (text: string) => string {
    /* The below function is passed to text-editor, so bind the correct 'this'
    to that function. */
    return ((text: string) => {
      // Remove the last '</div>\n\n'.
      let regExpTarget: string = text.substring(0, text.length - 8);
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
      document = document.replace(DocumentComponent._SEPARATOR_DIV_REGEXP, '');
      
      return document;
    }).bind(this);
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
      let descriptions: Array<string> = splitTarget.split(DocumentComponent.
        _SEPARATOR_DIV_REGEXP);
      // Remove the first element, as it should be empty.
      descriptions.shift();
      let documentMap: Map<string, string> = new Map<string, string>();
      for (let j: number = 0; j < descriptions.length; j++) {
        if ((j % 2) === 0) {
          documentMap.set(descriptions[j], descriptions[j + 1]);
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
    }).bind(this);
  }
}
