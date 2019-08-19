import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { MarkdownService } from 'ngx-markdown';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DocumentConfigurationEditorComponent } from '../object-editor/document-configuration/document-configuration-editor.component';
import { TreeComponent, Action, ToggleAction } from '../tree/tree.component';
import { CopyComponent, CopySpecifications } from '../copy/copy.component';
import { TextEditorComponent } from '../text-editor/text-editor.component';
import { ObjectEditorComponent } from '../object-editor/object-editor.component';
import { AttributeInsertionComponent, AttributeInsertionSpecification,
  InsertionLocation,
  HeadingStyle } from '../text-editor/attribute-insertion/attribute-insertion.component';
import { ReportSpecificationComponent,
  ReportSpecifications } from '../reports/report-specification/report-specification.component';
import { MergeComponent, Difference,
  VersionSelection } from '../merge/merge.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { LocationMap } from '../../constants/LocationMap.data';

export interface DocumentComponent {
  id: string,
  attributeMap: any;
  parentId: string;
  childIds: Array<string>;
}

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
    if (this._textEditor && this._textEditor.editor) {
      if (this._documentConfiguration) {
        // Migration code
        for (let id in this._documentConfiguration.components) {
          if (this._documentConfiguration.components[id].hasOwnProperty(
            'includeDescendants')) {
            let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
              getProxyFor(id);
            let documentComponent: any = {
              id: id,
              attributeMap: {
                description: (itemProxy.item.description ? itemProxy.item.
                  description : '')
              },
              parentId: null,
              childIds: []
            };
            
            let includeDescendants: boolean = this._documentConfiguration.
              components[id].includeDescendants;
            this._documentConfiguration.components[id] = documentComponent;
            
            if (includeDescendants) {
              let process: (descendant: ItemProxy) => void = (descendant:
                ItemProxy) => {
                let descendantDocumentComponent: any = {
                  id: descendant.item.id,
                  attributeMap: {
                    description: (descendant.item.description ? descendant.
                      item.description : '')
                  },
                  parentId: descendant.item.parentId,
                  childIds: []
                };
                
                this._documentConfiguration.components[descendant.item.id] =
                  descendantDocumentComponent;
                
                for (let j: number = 0; j < descendant.children.length; j++) {
                  let child: ItemProxy = descendant.children[j];
                  process(child);
                  descendantDocumentComponent.childIds.push(child.item.id);
                }
              };
              for (let k: number = 0; k < itemProxy.children.length; k++) {
                let child: ItemProxy = itemProxy.children[k];
                process(child);
                documentComponent.childIds.push(child.item.id);
              }
            }
          }
        }
        
        if (this._textEditor.editor.editor) {
          this.buildDocument(true);
          this._textEditor.editor.editor.undoManager.clear();
        } else {
          this.buildDocument(false);
        }
        /* If the selected DocumentConfiguration has not been persisted, add it
        to the Array of DocumentConfigurations. */
        if (this._documentConfigurations.indexOf(this.
          _documentConfiguration) === -1) {
          this._documentConfigurations.unshift(this._documentConfiguration);
        }
        
        this._navigationService.navigate('Document', {
          id: this._documentConfiguration.id
        });
      }
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  private _documentConfigurations: Array<any> = [];
  get documentConfigurations() {
    return this._documentConfigurations;
  }
  
  private _linkOutlineAndDocument: boolean = false;
  get linkOutlineAndDocument() {
    return this._linkOutlineAndDocument;
  }
  set linkOutlineAndDocument(linkOutlineAndDocument: boolean) {
    this._linkOutlineAndDocument = linkOutlineAndDocument;
  }
  
  private _getOutlineDocumentComponentChildren: (element: any) => Array<any> =
    (element: any) => {
    let children: Array<any> = [];
    if (element === this._documentConfiguration) {
      for (let id in this._documentConfiguration.components) {
        let documentComponent: DocumentComponent = this._documentConfiguration.
          components[id];
        if (documentComponent.parentId === null) {
          children.push(documentComponent);
        }
      }
    } else {
      children.push(...(element as DocumentComponent).childIds.map((id:
        string) => {
        return this._documentConfiguration.components[id];
      }));
    }
    
    return children;
  };
  get getOutlineDocumentComponentChildren() {
    return this._getOutlineDocumentComponentChildren;
  }
  
  private _getDocumentComponentText: (element: any) => string = (element:
    any) => {
    let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      (element as DocumentComponent).id);
    return (itemProxy.item.name + ((this._documentConfiguration.components[
      (element as DocumentComponent).id].attributeMap['description'] ===
      itemProxy.item.description) ? '' : '*'));
  };
  get getDocumentComponentText() {
    return this._getDocumentComponentText;
  }
  
  private _outlineActions: Array<Action> = [
    new Action('Copy this Item', 'fa fa-copy', (element: any) => {
      return true;
    }, (element: any) => {
      return true;
    }, (element: any) => {
      this.copyDocumentComponents([(element as DocumentComponent)]);
    }),
    new Action('Move this Item', 'fa fa-arrow-circle-o-right', (element:
      any) => {
      return true;
    }, (element: any) => {
      return true;
    }, (element: any) => {
      this.moveDocumentComponents([(element as DocumentComponent)]);
    }), new Action('Remove this Item from the selected Document Configuration',
      'fa fa-times', (element: any) => {
      return true;
    }, (element: any) => {
      return true;
    }, (element: any) => {
      this.removeDocumentComponents([(element as DocumentComponent)]);
    })
  ];
  get outlineActions() {
    return this._outlineActions;
  }
  
  @ViewChild('outlineTree')
  private _outlineTree: TreeComponent;
  
  @ViewChild('textEditor')
  private _textEditor: TextEditorComponent;
  
  private _document: string = '';
  get document() {
    return this._document;
  }
  
  private _additionalToolbarButtonIds: Array<string> = ['insert', 'delineate',
    'export', 'update'];
  get additionalToolbarButtonIds() {
    return this._additionalToolbarButtonIds;
  }
  
  private _selectedAttributeName: string;
  
  @ViewChild('objectEditor')
  private _objectEditor: ObjectEditorComponent;
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  get itemRepository() {
    return this._itemRepository;
  }
  
  private _treeConfigurationSubscription: Subscription;
  
  get Object() {
    return Object;
  }
  
  private static readonly _INPUT_OPENING_HIDDEN_TAG: string =
    '<div id="" style="visibility: hidden;">' +
    '<div id="delineator" class="mceNonEditable" style="color: lightgray; text-align: center; display: none;">' +
    '------------------------' +
    '</div>\n\n';
  private static readonly _OUTPUT_OPENING_HIDDEN_TAG: string =
    '<div id="" style="visibility: hidden;">' +
    '\n\n' +
    '<div id="delineator" class="mceNonEditable" style="color: lightgray; text-align: center; display: none;">' +
    '\n\n' +
    '\\------------------------' +
    '\n\n' +
    '</div>\n\n';
  private static readonly _CLOSING_HIDDEN_TAG: string = '</div>\n\n';
  private static readonly _SEPARATOR_DIV_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;">\s{0,2}<div id="[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}delineator" class="mceNonEditable" style="color: lightgray; text-align: center;[\s\S]*?">\s{0,2}\\{0,1}-{12}[\s\S]+?-{12}\s{0,2}<\/div>\s{2}/g;
  private static readonly _ATTRIBUTE_REGEXP: RegExp =
    /<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[\s\S]*?)" style="visibility: hidden;">\s{0,2}<div id="[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[\s\S]*?delineator" class="mceNonEditable" style="color: lightgray; text-align: center;[\s\S]*?">\s{0,2}\\{0,1}-{12}[\s\S]+?-{12}\s{0,2}<\/div>\s{2}/g;
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<DocumentComponent>,
    private _dialogService: DialogService, private _itemRepository:
    ItemRepository, private _navigationService: NavigationService,
    private _markdownService: MarkdownService) {
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
          
          if (this._documentConfiguration) {
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
  
  public customizeEditor(editor: any): void {
    editor.ui.registry.addMenuButton(this._additionalToolbarButtonIds[0], {
      text: 'Insert',
      fetch: (callback: Function) => {
        let menuItems: Array<any> = [
          {
            type: 'menuitem',
            text: 'Globally...',
            onAction: (button: any) => {
              this.insert(undefined);
            }
          }
        ];
        let insertionCandidates: Array<string> = [];
        let outlineTreeSelection: Array<any> = this._outlineTree.selection;
        if (outlineTreeSelection.length > 0) {
          let firstAttributeNameSet: Array<string> = Object.keys(
            TreeConfiguration.getWorkingTree().getProxyFor(
            (outlineTreeSelection[0] as DocumentComponent).id).model.item.
            classProperties).filter((attributeName: string) => {
            return (attributeName !== 'description');
          });
          for (let j: number = 1; j < outlineTreeSelection.length; j++) {
            let otherAttributeNameSet: Array<string> = Object.keys(
              TreeConfiguration.getWorkingTree().getProxyFor(
              (outlineTreeSelection[j] as DocumentComponent).id).model.item.
              classProperties);
            firstAttributeNameSet = firstAttributeNameSet.filter(
              (attributeName: string) => {
              return (otherAttributeNameSet.indexOf(attributeName) !== -1);
            });
          }
          
          insertionCandidates = firstAttributeNameSet;
        }
          
        for (let j: number = (insertionCandidates.length - 1); j >= 0; j--) {
          menuItems.unshift({
            type: 'menuitem',
            text: insertionCandidates[j],
            onAction: (button: any) => {
              this.insert(insertionCandidates[j]);
            }
          });
        }
        
        callback(menuItems);
      }
    });
    editor.ui.registry.addToggleButton(this._additionalToolbarButtonIds[1], {
      text: 'Delineate',
      active: (this._documentConfiguration && this._documentConfiguration.
        delineated),
      onAction: (button: any) => {
        let delineate: boolean = !button.isActive();
        this.toggleDelineation(delineate);
        button.setActive(delineate);
      }
    });
    editor.ui.registry.addButton(this._additionalToolbarButtonIds[2], {
      text: 'Export',
      onAction: (button: any) => {
        this.export();
      }
    });
    editor.ui.registry.addButton(this._additionalToolbarButtonIds[3], {
      text: 'Update',
      //disabled: !this.areUpdatesAvailable(),
      onAction: (button: any) => {
        this.update();
      }
    });
  }
  
  public addDocumentComponents(): void {
    let includeDescendantsArray: Array<ItemProxy> = [];
    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        allowMultiselect: true,
        actions: [new ToggleAction('Include descendants', 'fa fa-arrow-down',
          (element: any) => {
          return true;
        }, (element: any) => {
          return ((element as ItemProxy).children.length > 0);
        }, (element: any) => {
          return (includeDescendantsArray.indexOf(element) !== -1);
        }, (element: any) => {
          let elementIndex: number = includeDescendantsArray.indexOf(element);
          if (elementIndex === -1) {
            includeDescendantsArray.push(element);
          } else {
            includeDescendantsArray.splice(elementIndex, 1);
          }
        })]
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        for (let j: number = 0; j < selection.length; j++) {
          let itemProxy: ItemProxy = (selection[j] as ItemProxy);
          let documentComponent: any = {
            id: itemProxy.item.id,
            attributeMap: {
              description: (itemProxy.item.description ? itemProxy.item.
                description : '')
            },
            parentId: null,
            childIds: []
          };
          
          this._documentConfiguration.components[itemProxy.item.id] =
            documentComponent;
          
          if (includeDescendantsArray.indexOf(itemProxy) !== -1) {
            let process: (descendant: ItemProxy) => void = (descendant:
              ItemProxy) => {
              let descendantDocumentComponent: any = {
                id: descendant.item.id,
                attributeMap: {
                  description: (descendant.item.description ? descendant.item.
                    description : '')
                },
                parentId: descendant.item.parentId,
                childIds: []
              };
              
              this._documentConfiguration.components[descendant.item.id] =
                descendantDocumentComponent;
              
              for (let j: number = 0; j < descendant.children.length; j++) {
                let child: ItemProxy = descendant.children[j];
                process(child);
                descendantDocumentComponent.childIds.push(child.item.id);
              }
            };
            for (let k: number = 0; k < itemProxy.children.length; k++) {
              let child: ItemProxy = itemProxy.children[k];
              process(child);
              documentComponent.childIds.push(child.item.id);
            }
          }
        }
        
        this.buildDocument(false);
        this._textEditor.editor.editor.setDirty(true);
        this._outlineTree.update(true);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public copyDocumentComponents(documentComponents: Array<DocumentComponent>):
    void {
    this._dialogService.openComponentDialog(CopyComponent, {
      data: {
        allowDocumentAdditionSpecification: true
      },
      disableClose: true
    }).updateSize('40%', '40%').afterClosed().subscribe(
      async (copySpecifications: CopySpecifications) => {
      if (copySpecifications) {
        for (let j: number = 0; j < documentComponents.length; j++) {
          let process: (itemProxy: ItemProxy, parentId:
            string) => Promise<ItemProxy> = async (itemProxy: ItemProxy,
            parentId: string) => {
            let documentComponent: DocumentComponent = documentComponents[j];
            let item: any = JSON.parse(JSON.stringify(itemProxy.item));
            
            if (copySpecifications.clearNonNameAttributes) {
              for (let attributeName in item) {
                if ((attributeName !== 'name') && (attributeName !==
                  'parentId')) {
                  if (itemProxy.model.item.classProperties[attributeName].
                    definition.required) {
                    item[attributeName] = itemProxy.model.item.classProperties[
                      attributeName].definition.default;
                  } else {
                    delete item[attributeName];
                  }
                }
              }
            } else {
              for (let attributeName in documentComponent.attributeMap) {
                item[attributeName] = documentComponent.attributeMap[
                  attributeName];
              }
              
              delete item.id;
              /* Removing the below attribute should cause a related attribute
              to also be set. */
              delete item.createdBy;
              delete item.itemIds;
            }
            
            item.parentId = parentId;
            
            if (copySpecifications.appendToOriginalName) {
              item.name += copySpecifications.nameOrSuffix;
            } else {
              item.name = copySpecifications.nameOrSuffix;
            }
            
            let copiedItemProxy: ItemProxy = await this._itemRepository.
              upsertItem(itemProxy.kind, item);
            
            let childIds: Array<string> = [];
            if (copySpecifications.copyDescendants) {
              for (let k: number = 0; k < itemProxy.children.length; k++) {
                childIds.push((await process(itemProxy.children[k],
                  copiedItemProxy.item.id)).item.id);
                // To-do: populate itemIds for copiedItemProxy
              }
            }
            
            if (copySpecifications.addToDocument) {
              let documentComponentCopy: DocumentComponent = JSON.parse(JSON.
                stringify(documentComponent));
              documentComponentCopy.id = copiedItemProxy.item.id;
              for (let attributeName in documentComponentCopy.attributeMap) {
                documentComponentCopy.attributeMap[attributeName] =
                  documentComponent.attributeMap[attributeName];
                
                if ((attributeName === 'description') && (documentComponent[
                  attributeName] == null)) {
                  documentComponentCopy[attributeName] = '';
                }
              }
              
              if (documentComponents[j].parentId === null) {
                documentComponentCopy.parentId = null;
              } else {
                documentComponentCopy.parentId = parentId;
                let parent: DocumentComponent = this._documentConfiguration.
                  components[parentId];
                if (parent && parent.childIds.indexOf(documentComponentCopy.
                  id) === -1) {
                  parent.childIds.push(documentComponentCopy.id);
                }
              }
              
              documentComponentCopy.childIds = childIds;
              
              this._documentConfiguration.components[documentComponentCopy.id] =
                documentComponentCopy;
            }
            
            return copiedItemProxy;
          };
          let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(documentComponents[j].id);
          await process(itemProxy, itemProxy.item.parentId);
        }
        
        if (copySpecifications.addToDocument) {
          this.buildDocument(false);
          this._textEditor.editor.editor.setDirty(true);
          this._outlineTree.update(true);
        }
        
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public moveDocumentComponents(documentComponents: Array<DocumentComponent>):
    void {
    let selectedMoveLocation: string;
    let locations: Array<string> = ['Before', 'After', 'Child'];
    this._dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: this._documentConfiguration,
        getChildren: (element: any) => {
          let children: Array<any> = this._getOutlineDocumentComponentChildren(
            element);
          for (let j: number = 0; j < documentComponents.length; j++) {
            let moveCandidateIndex: number = children.indexOf(
              documentComponents[j]);
            if (moveCandidateIndex !== -1) {
              children.splice(moveCandidateIndex, 1);
            }
          }
          
          return children;
        },
        getText: this._getDocumentComponentText,
        elementSelectionHandler: (element: any) => {
          this._dialogService.openSelectDialog('Move Location', 'Please ' +
            'select a move location:', 'Move Location', locations[2],
            locations).afterClosed().subscribe((selectedLocation:
            string) => {
            if (selectedLocation) {
              selectedMoveLocation = selectedLocation;
            } else {
              selectedMoveLocation = locations[2];
            }
          });
        }
      },
      disableClose: true
    }).updateSize('80%', '80%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        for (let j: number = 0; j < documentComponents.length; j++) {
          let outlineDocumentComponent: DocumentComponent = documentComponents[
            j];
          let referenceDocumentComponent: DocumentComponent =
            (selection[0] as DocumentComponent);
          if (outlineDocumentComponent.parentId !== null) {
            let previousParent: DocumentComponent = this.
              _documentConfiguration.components[outlineDocumentComponent.
              parentId];
            previousParent.childIds.splice(previousParent.childIds.indexOf(
              outlineDocumentComponent.id), 1);
          }
          
          if (selectedMoveLocation === locations[2]) {
            outlineDocumentComponent.parentId = referenceDocumentComponent.id;
            referenceDocumentComponent.childIds.push(outlineDocumentComponent.
              id);
          } else {
            let newParent: DocumentComponent = this._documentConfiguration.
              components[referenceDocumentComponent.parentId];
            outlineDocumentComponent.parentId = newParent.id;
            newParent.childIds.splice(newParent.childIds.indexOf(
              referenceDocumentComponent.id) + ((selectedMoveLocation ===
              locations[0]) ? 0 : 1), 0, outlineDocumentComponent.id);
          }
        }
        
        this.buildDocument(false);
        this._textEditor.editor.editor.setDirty(true);
        this._outlineTree.update(true);
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  
  public removeDocumentComponents(documentComponents:
    Array<DocumentComponent>): void {
    if ((documentComponents.length === 1) && (documentComponents[0].childIds.
      length === 0)) {
      let documentComponent: DocumentComponent = documentComponents[0];
      if (documentComponent.parentId !== null) {
        let parent: DocumentComponent = this._documentConfiguration.
          components[documentComponent.parentId];
        parent.childIds.splice(parent.childIds.indexOf(documentComponent.id),
          1);
      }
      delete this._documentConfiguration.components[documentComponent.id];
      
      this.buildDocument(false);
      this._textEditor.editor.editor.setDirty(true);
      this._outlineTree.update(true);
      this._changeDetectorRef.markForCheck();
    } else {
      this._dialogService.openCustomTextDialog('Remove Descendants', 'Do ' +
        'you want to remove the descendants of the selected components also?',
        ['Cancel', 'Yes', 'No']).subscribe((response: any) => {
        if (response) {
          for (let j: number = 0; j < documentComponents.length; j++) {
            let documentComponent: DocumentComponent = documentComponents[j];
            if (response === 1) {
              let documentComponentStack: Array<DocumentComponent> = [
                ...documentComponent.childIds.map((childId: string) => {
                return this._documentConfiguration.components[childId];
              })];
              while (documentComponentStack.length > 0) {
                let descendant: DocumentComponent = documentComponentStack.
                  shift();
                documentComponentStack.push(...descendant.childIds.map(
                  (childId: string) => {
                  return this._documentConfiguration.components[childId];
                }));
                delete this._documentConfiguration.components[descendant.id];
              }
            } else {
              /* Since descendants are not to be removed, move all descendants
              up one level. */
              if (documentComponent.parentId !== null) {
                let parent: DocumentComponent = this._documentConfiguration.
                  components[documentComponent.parentId];
                parent.childIds.splice(parent.childIds.indexOf(
                  documentComponent.id), 0, ...documentComponent.childIds);
              }
              for (let j: number = 0; j < documentComponent.childIds.length;
                j++) {
                this._documentConfiguration.components[documentComponent.
                  childIds[j]].parentId = documentComponent.parentId;
              }
            }
            
            if (documentComponent.parentId !== null) {
              let parent: DocumentComponent = this._documentConfiguration.
                components[documentComponent.parentId];
              parent.childIds.splice(parent.childIds.indexOf(
                documentComponent.id), 1);
            }
            delete this._documentConfiguration.components[documentComponent.
              id];
          }
          
          this.buildDocument(false);
          this._textEditor.editor.editor.setDirty(true);
          this._outlineTree.update(true);
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }
  
  public outlineDocumentComponentSelected(id: string): void {
    this._textEditor.editor.editor.dom.select('div#' + id)[0].scrollIntoView();
    let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      id);
    /* Currently, type must be set before object, as the object setter
    references type. */
    this._objectEditor.type = itemProxy.model.item;
    this._objectEditor.object = itemProxy.item;
    this._changeDetectorRef.markForCheck();
  }
  
  public selectionChanged(selection: any): void {
    let anchorReference: any = selection.getSel().anchorNode;
    let focusReference: any = selection.getSel().focusNode;
    let itemStartRegExp: RegExp =
      /^<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})" style="visibility: hidden;"/;
    let attributeStartRegExp: RegExp =
      /^<div id="([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}[\s\S]+?)" style="visibility: hidden;"/;
    let match: any;
    do {
      if ((match = attributeStartRegExp.exec(anchorReference.outerHTML)) !==
        null) {
        let itemId: string = match[1].substring(0, 36);
        this._selectedAttributeName = match[1].substring(36);
        /* If the Selection's focusNode was set from a previous modification,
        do not further modify the Selection. */
        if (attributeStartRegExp.exec(focusReference.outerHTML) === null) {
          let focusMatch: any;
          do {
            if ((focusMatch = itemStartRegExp.exec(focusReference.
              outerHTML)) !== null) {
              /* The Selection's focusNode was set from a previous modification
              to the Selection. */
              break;
            }
            
            if ((focusMatch = attributeStartRegExp.exec(focusReference.
              outerHTML)) !== null) {
              let focusNode: any;
              let focusItemId: string = focusMatch[1].substring(0, 36);
              let focusAttributeName: string = focusMatch[1].substring(36);
              if (itemId !== focusItemId) {
                // Different Items
                let anchorDocumentComponentIndex: number = this.
                  getDocumentComponentIndex(itemId);
                let focusDocumentComponentIndex: number = this.
                  getDocumentComponentIndex(focusItemId);
                if (anchorDocumentComponentIndex <
                  focusDocumentComponentIndex) {
                  // Forward selection
                  focusNode = this._textEditor.editor.editor.dom.select(
                    'div#' + this.getDocumentComponent(
                    anchorDocumentComponentIndex + 1).id)[0];                      
                } else {
                  // Reverse selection. Skip the delineator.
                  focusNode = anchorReference.childNodes.item(1);
                }
              } else if (this._selectedAttributeName !== focusAttributeName) {
                // Same Item, different attributes
                let attributeNames: Array<string> = Object.keys(this.
                  _documentConfiguration.components[itemId].attributeMap);
                let anchorAttributeNameIndex: number = attributeNames.indexOf(
                  this._selectedAttributeName);
                if (anchorAttributeNameIndex < attributeNames.indexOf(
                  focusAttributeName)) {
                  // Forward selection
                  focusNode = this._textEditor.editor.editor.dom.select(
                    'div#' + itemId + attributeNames[anchorAttributeNameIndex +
                    1])[0];
                } else {
                  // Reverse selection. Skip the delineator.
                  focusNode = this._textEditor.editor.editor.dom.select(
                    'div#' + itemId + this._selectedAttributeName)[0].
                    childNodes.item(1);
                }
              }
              
              if (focusNode) {
                selection.getSel().extend(focusNode, 0);
              }
            
              break;
            }
            
            focusReference = focusReference.parentNode;
          } while (focusReference);
        }
        
        if (this._outlineTree && this._linkOutlineAndDocument) {
          this._outlineTree.selection = [this._documentConfiguration.
            components[itemId]];
        }
        
        let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
          getProxyFor(itemId);
        /* Currently, type must be set before object, as the object setter
        references type. */
        this._objectEditor.type = itemProxy.model.item;
        this._objectEditor.object = itemProxy.item;
        
        this._changeDetectorRef.markForCheck();
        
        break;
      }
      
      anchorReference = anchorReference.parentNode;
    } while (anchorReference);
  }
  
  private getDocumentComponentIndex(id: string): number {
    let index: number = 0;
    let process: (documentComponent: DocumentComponent) => number =
      (documentComponent: DocumentComponent) => {
      if (documentComponent.id === id) {
        return index;
      } else {
        index++;
        for (let j: number = 0; j < documentComponent.childIds.length; j++) {
          let result: number = process(this._documentConfiguration.components[
            documentComponent.childIds[j]]);
          if (result !== undefined) {
            return index;
          }
        }
        
        return undefined;
      }
    };
    for (let id in this._documentConfiguration.components) {
      let documentComponent: DocumentComponent = this._documentConfiguration.
        components[id];
      if (documentComponent.parentId == null) {
        let result: number = process(documentComponent);
        if (result !== undefined) {
          return index;
        }
      }
    }
    
    return -1;
  }
  
  private getDocumentComponent(index: number): DocumentComponent {
    if (index > -1) {
      let process: (documentComponent:
        DocumentComponent) => DocumentComponent = (documentComponent:
        DocumentComponent) => {
        if (index === 0) {
          return documentComponent;
        } else {
          index--;
          for (let j: number = 0; j < documentComponent.childIds.length; j++) {
            let result: DocumentComponent = process(this.
              _documentConfiguration.components[documentComponent.childIds[
              j]]);
            if (result !== undefined) {
              return result;
            }
          }
          
          return undefined;
        }
      };
      for (let id in this._documentConfiguration.components) {
        let documentComponent: DocumentComponent = this._documentConfiguration.
          components[id];
        if (documentComponent.parentId == null) {
          let result: DocumentComponent = process(documentComponent);
          if (result !== undefined) {
            return result;
          }
        }
      }
    }
    
    return undefined;
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
        let attributeMap: any = this._documentConfiguration.components[itemId].
          attributeMap;
        if (!attributeMap) {
          attributeMap = {};
          this._documentConfiguration.components[itemId].attributeMap =
            attributeMap;
        } else {
          for (let attributeName in attributeMap) {
            delete attributeMap[attributeName];
          }
        }
        
        let content: string = itemIdsAndContent[j + 1];
        // Remove the last '</div>\n\n'.
        let attributeRegExpTarget: string = content.substring(0, content.
          length - 8);
        /* Reverse attributeRegExpTarget to remove inserted '</div>\n\n's in
        reverse. */
        let attributeSplitTarget: string = attributeRegExpTarget.split('').
          reverse().join('');
        let match: any;
        while ((match = DocumentComponent._ATTRIBUTE_REGEXP.exec(
          attributeRegExpTarget)) != null) {
          if (match.index !== 0) {
            attributeSplitTarget = attributeSplitTarget.substring(0,
              (attributeRegExpTarget.length - match.index)) +
              attributeSplitTarget.substring(attributeRegExpTarget.length -
              match.index + 8);
          }
        }
        // Re-orient attributeSplitTarget.
        attributeSplitTarget = attributeSplitTarget.split('').reverse().
          join('');
        
        let idsAndValues: Array<string> = attributeSplitTarget.split(
          DocumentComponent._ATTRIBUTE_REGEXP);
        idsAndValues.shift();
        for (let k: number = 0; k < idsAndValues.length; k++) {
          if ((k % 2) === 0) {
            let attribute: string = idsAndValues[k + 1];
            /* If this attribute is not the last attribute of the document,
            trim off one '\n'. */
            if (!((j === (itemIdsAndContent.length - 2)) && (k ===
              (idsAndValues.length - 2)))) {
              attribute = attribute.substring(0, attribute.length - 1);
            }
            
            if ((idsAndValues[k] === 'description') || attribute) {
              attributeMap[idsAndValues[k].substring(36)] = attribute;
            }
          }
        }
        
        let element: any = this._textEditor.editor.editor.dom.select('div#' +
          itemId + 'delineator')[0];
        if (element) {
          let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(itemId);
          this._textEditor.editor.editor.dom.setHTML(element, '------------' +
            itemProxy.item.name + ((itemProxy.item.description ===
            attributeMap['description']) ? '' : '*') + '------------');
        }
      }
    }
    
    if (this._outlineTree) {
      this._outlineTree.update(false);
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  private insert(insertionIdentifier: string): void {
    if (insertionIdentifier) {
      let insertionPositions: Array<string> = ['Before', 'After'];
      for (let j: number = 0; j < this._outlineTree.selection.length; j++) {
        let documentComponent: DocumentComponent = this._outlineTree.selection[
          j];
        let attributeMap: any = documentComponent.attributeMap;
        let intermediateMap: any = {};
        let attributeNames: Array<string> = Object.keys(attributeMap);
        let insertionIdentifierIndex: number = attributeNames.indexOf(
          insertionIdentifier);
        if (insertionIdentifierIndex !== -1) {
          attributeNames.splice(insertionIdentifierIndex, 1);
        }
        
        let selectedAttributeIndex: number = attributeNames.indexOf(this.
          _selectedAttributeName);
        this._dialogService.openSelectDialog('Select Insertion Position',
          'Please select where you want to insert the value of ' +
          insertionIdentifier + ' in relation to the selected attribute:',
          'Insertion Position', insertionPositions[1], insertionPositions).
          afterClosed().subscribe((insertionPosition: string) => {
          if (insertionPosition) {
            for (let j: number = 0; j < selectedAttributeIndex; j++) {
              intermediateMap[attributeNames[j]] = attributeMap[attributeNames[
                j]];
            }
            
            let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
              getProxyFor(documentComponent.id);
            if (insertionPosition === insertionPositions[0]) {
              intermediateMap[insertionIdentifier] = itemProxy.item[
                insertionIdentifier];
              intermediateMap[attributeNames[selectedAttributeIndex]] =
                attributeMap[attributeNames[selectedAttributeIndex]];
            } else {
              intermediateMap[attributeNames[selectedAttributeIndex]] =
                attributeMap[attributeNames[selectedAttributeIndex]];
              intermediateMap[insertionIdentifier] = itemProxy.item[
                insertionIdentifier];
            }
            
            for (let j: number = selectedAttributeIndex + 1; j <
              attributeNames.length; j++) {
              intermediateMap[attributeNames[j]] = attributeMap[attributeNames[
                j]];
            }
            
            for (let attributeName in attributeMap) {
              delete attributeMap[attributeName];
            }
            
            for (let attributeName in intermediateMap) {
              attributeMap[attributeName] = intermediateMap[attributeName];
            }
            
            this.buildDocument(false);
            this._textEditor.editor.editor.setDirty(true);
            this._changeDetectorRef.markForCheck();
          }
        });
      }
    } else {
      this._dialogService.openComponentDialog(AttributeInsertionComponent, {
        data: {},
        disableClose: true
      }).updateSize('90%', '90%').afterClosed().subscribe(
        (attributeInsertionSpecification: AttributeInsertionSpecification) => {
        if (attributeInsertionSpecification) {
          let documentIds: Array<string> = Object.keys(this.
            _documentConfiguration.components);
          for (let j: number = 0; j < documentIds.length; j++) {
            let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
              getProxyFor(documentIds[j]);
            let typeObject: any = attributeInsertionSpecification.types[
              itemProxy.kind];
            if (typeObject) {
              let attributeMap: any = this._documentConfiguration.components[
                documentIds[j]].attributeMap;
              let intermediateMap: any = {};
              if (attributeInsertionSpecification.insertionLocation ===
                InsertionLocation.Top) {
                for (let attributeName in typeObject.attributes) {
                  intermediateMap[attributeName] = this.
                    getAttributeInsertionString(itemProxy, attributeName,
                    typeObject.attributes[attributeName]);
                }
                
                for (let attributeName in attributeMap) {
                  intermediateMap[attributeName] = attributeMap[attributeName];
                  delete attributeMap[attributeName];
                }
                
                for (let attributeName in intermediateMap) {
                  attributeMap[attributeName] = intermediateMap[attributeName];
                }
              } else {
                for (let attributeName in typeObject.attributes) {
                  attributeMap[attributeName] = this.
                    getAttributeInsertionString(itemProxy, attributeName,
                    typeObject.attributes[attributeName]);
                }
              }
            }
          }
          
          this.buildDocument(false);
          this._textEditor.editor.editor.setDirty(true);
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }
  
  private getAttributeInsertionString(itemProxy: ItemProxy, attributeName:
    string, insertionParametersObject: any): string {
    let attributeString: string = '';
    attributeString += this.getFormattedOpeningHiddenTag(itemProxy.item.id +
      attributeName, attributeName, false);
    
    if (attributeName === 'name') {
      if (insertionParametersObject.showAttributeName) {
        attributeString += attributeName + ': ';
      }
      
      let headingLevel: number = -1;
      if (insertionParametersObject.headingStyle === HeadingStyle.STRUCTURAL) {
        let componentIds: Array<string> = Object.keys(this.
          _documentConfiguration.components);
        for (let j: number = 0; j < componentIds.length; j++) {
          headingLevel = itemProxy.getDepthFromAncestor(TreeConfiguration.
            getWorkingTree().getProxyFor(componentIds[j]));
          if (headingLevel !== -1) {
            // Add one to headingLevel to account for the hierarchy root
            headingLevel += 1;
            break;
          }
        }
      } else {
        let headingStyleValues: Array<string> = Object.values(HeadingStyle);
        headingLevel = headingStyleValues.indexOf(insertionParametersObject.
          headingStyle);
      }
      
      for (let j: number = 0; j < headingLevel; j++) {
        attributeString += '#';
      }
      
      if (headingLevel > 0) {
        attributeString += ' ';
      }

      if (insertionParametersObject.linkToItem) {
        attributeString += '[' + itemProxy.item.name + '](' + window.
          location.origin + LocationMap['Explore'].route + ';id=' +
          itemProxy.item.id + ')\n\n';
      } else {
        attributeString += itemProxy.item.name;
      }
    } else {
      if (insertionParametersObject.showAttributeName) {
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

      attributeString += addition;
    }
    
    return attributeString;
  }
  
  private toggleDelineation(delineate: boolean): void {
    let documentIds: Array<string> = Object.keys(this._documentConfiguration.
      components);
    for (let j: number = 0; j < documentIds.length; j++) {
      let separatorIds: Array<string> = [documentIds[j]];
      // separatorIds.push(...Object.keys(this._documentConfiguration.
      //   components[documentIds[j]].attributeMap).map((attributeName:
      //   string) => {
      //   return documentIds[j] + attributeName;
      // }));
      for (let k: number = 0; k < separatorIds.length; k++) {
        let element: any = this._textEditor.editor.editor.dom.select('div#' +
          separatorIds[k] + 'delineator')[0];
        if (element) {
          this._textEditor.editor.editor.dom.setStyle(element, 'display',
            (delineate ? '' : 'none'));
        }
      }
    }
    
    this._documentConfiguration.delineated = delineate;
  }
  
  private export(): void {
    this._dialogService.openComponentDialog(
      ReportSpecificationComponent, {
      data: {
        defaultName: this._documentConfiguration.name + '_' + new Date().
          toISOString(),
        getReportContent: (initialContent: string, reportSpecifications:
          ReportSpecifications) => {
          let content: string = initialContent;
          let documentComponents: Array<DocumentComponent> = Object.values(
            this._documentConfiguration.components);
          for (let j: number = 0; j < documentComponents.length; j++) {
            if (documentComponents[j].parentId === null) {
              let process: (documentComponent: DocumentComponent) => void =
                (documentComponent: DocumentComponent) => {
                let attributeMap: any = documentComponent.attributeMap;
                let attributeNames: Array<string> = Object.keys(attributeMap);
                for (let k: number = 0; k < attributeNames.length; k++) {
                  content += attributeMap[attributeNames[k]] + '\n\n';
                }
                
                for (let k: number = 0; k < documentComponent.childIds.length;
                  k++) {
                  process(this._documentConfiguration.components[
                    documentComponent.childIds[k]]);
                }
              };
              process(documentComponents[j]);
            }
          }
          
          // Trim off the last '\n\n'.
          content = content.substring(0, content.length - 2);
          return content;
        }
      },
      disableClose: true
    }).updateSize('40%', '40%');
  }
  
  private areUpdatesAvailable(): boolean {
    let documentIds: Array<string> = Object.keys(this._documentConfiguration.
      components);
    for (let j: number = 0; j < documentIds.length; j++) {
      let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
        getProxyFor(documentIds[j]);
      let attributeMap: any = this._documentConfiguration.components[
        documentIds[j]].attributeMap;
      let attributeNames: Array<string> = Object.keys(attributeMap);
      for (let k: number = 0; k < attributeNames.length; k++) {
        let remoteValue: string = String(itemProxy.item[
          attributeNames[k]]);
        let localValue: string = attributeMap[attributeNames[k]];
        if (remoteValue !== localValue) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private update(): void {
    let differences: Array<Difference> = [];
    let documentIds: Array<string> = Object.keys(this._documentConfiguration.
      components);
    for (let j: number = 0; j < documentIds.length; j++) {
      let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
        getProxyFor(documentIds[j]);
      let difference: Difference;
      let attributeMap: any = this._documentConfiguration.components[
        documentIds[j]].attributeMap;
      let attributeNames: Array<string> = Object.keys(attributeMap);
      for (let k: number = 0; k < attributeNames.length; k++) {
        let remoteValue: string = String(itemProxy.item[
          attributeNames[k]]);
        let localValue: string = attributeMap[attributeNames[k]];
        if (remoteValue !== localValue) {
          if (!difference) {
            difference = new Difference(itemProxy, undefined, undefined, []);
            differences.push(difference);
          }
          
          difference.subDifferences.push(new Difference(attributeNames[k],
            localValue, remoteValue, []));
        }
      }
    }
    
    if (differences.length > 0) {
      this._dialogService.openComponentDialog(MergeComponent, {
        data: {
          differences: differences
        },
        disableClose: true
      }).updateSize('90%', '90%').afterClosed().subscribe((differences:
        Array<Difference>) => {
        if (differences) {
          for (let j: number = 0; j < differences.length; j++) {
            let difference: Difference = differences[j];
            let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
              getProxyFor(difference.element.item.id);
            for (let k: number = 0; k < difference.subDifferences.length;
              k++) {
              let subDifference: Difference = difference.subDifferences[k];
              let attributeMap: any = this._documentConfiguration.components[
                itemProxy.item.id].attributeMap;
              if (subDifference.versionSelection === VersionSelection.REMOTE) {
                attributeMap[subDifference.element] = subDifference.
                  remoteValue;
              }
            }
          }
          
          this.buildDocument(true);
          /* Only save the documentConfiguration if it has already been
          persisted */
          let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(this._documentConfiguration.id);
          if (itemProxy.kind === 'DocumentConfiguration') {
            this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
          }
          
          if (this._outlineTree) {
            this._outlineTree.update(false);
          }
          
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }
  
  public saveObjectEditorObject(): void {
    let objectEditorObject: any = this._objectEditor.close(true);
    let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      objectEditorObject['id']);
    this._itemRepository.upsertItem(itemProxy.kind, objectEditorObject);
  }
  
  private buildDocument(clearModificationIndicator: boolean): void {
    let document: string = '';
    let documentComponents: Array<DocumentComponent> = Object.values(this.
      _documentConfiguration.components);
    for (let j: number = 0; j < documentComponents.length; j++) {
      if (documentComponents[j].parentId === null) {
        let process: (documentComponent: DocumentComponent) => void =
          (documentComponent: DocumentComponent) => {
          let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
            getProxyFor(documentComponent.id);
          document += this.getFormattedOpeningHiddenTag(documentComponent.id,
            itemProxy.item.name, false);
          
          let attributeMap: any = this._documentConfiguration.components[
            documentComponent.id].attributeMap;
          let attributeNames: Array<string> = Object.keys(attributeMap);
          for (let k: number = 0; k < attributeNames.length; k++) {
            document += this.getFormattedOpeningHiddenTag(documentComponent.
              id + attributeNames[k], attributeNames[k], false);
            document += attributeMap[attributeNames[k]] + '\n\n';
            document += DocumentComponent._CLOSING_HIDDEN_TAG;
          }
          
          document += DocumentComponent._CLOSING_HIDDEN_TAG;
          
          if (clearModificationIndicator) {
            let element: any = this._textEditor.editor.editor.dom.select(
              'div#' + documentComponent.id + 'delineator')[0];
            if (element) {
              this._textEditor.editor.editor.dom.setHTML(element,
                '------------' + itemProxy.item.name + '------------');
            }
          }
          
          for (let k: number = 0; k < documentComponent.childIds.length; k++) {
            process(this._documentConfiguration.components[documentComponent.
              childIds[k]]);
          }
        };
        process(documentComponents[j]);
      }
    }
    
    this._document = this._markdownService.compile(document);
  }
  
  public async save(text: string): Promise<void> {
    this.textEditorContentChanged(text);
    let documentIds: Array<string> = Object.keys(this._documentConfiguration.
      components);
    for (let j: number = 0; j < documentIds.length; j++) {
      let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
        getProxyFor(documentIds[j]);
      let description: string = this._documentConfiguration.components[
        documentIds[j]].attributeMap['description'];
      if (description == null) {
        description = '';
      }
      
      // Don't save any Items whose description was not modified.
      if (itemProxy.item.description !== description) {
        itemProxy.item.description = description;
        await this._itemRepository.upsertItem(itemProxy.kind, itemProxy.
          item);
        let element: any = this._textEditor.editor.editor.dom.select(
          'div#' + documentIds[j] + 'delineator')[0];
        if (element) {
          this._textEditor.editor.editor.dom.setHTML(element,
            '------------' + itemProxy.item.name + '------------');
        }
      }
    }
    
    // Only save the documentConfiguration if it has already been persisted
    let itemProxy: ItemProxy = TreeConfiguration.getWorkingTree().
      getProxyFor(this._documentConfiguration.id);
    if (itemProxy.kind === 'DocumentConfiguration') {
      this._itemRepository.upsertItem(itemProxy.kind, itemProxy.item);
    }
    
    if (this._outlineTree) {
      this._outlineTree.update(false);
    }
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
    
    /* If the document was previously delineated, display Item-level
    delineation. */
    if (this._documentConfiguration.delineated && (id.length === 36)) {
      formattedOpeningHiddenTag = formattedOpeningHiddenTag.replace(
        /display: none;/, '');
    }
    
    return formattedOpeningHiddenTag;
  }
}
