import { Component, OnInit, Input, Optional, Inject,
  ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatStepper, MatDialogRef } from '@angular/material';

import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { FormatDefinitionType } from '../type-editor/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'create-wizard',
  templateUrl: './create-wizard.component.html',
  styleUrls: ['./create-wizard.component.scss']
})
export class CreateWizardComponent extends NavigatableComponent
  implements OnInit {
  /* Data */
  private _parentId: string;
  @Input('parentId')
  set parentId(parentId: string) {
    this._parentId = parentId;
  }
  
// tslint:disable-next-line: no-inferrable-types
  private _isDisabled: boolean = false;
  get isDisabled() {
    return this._isDisabled;
  }
  errorMessage: any;
  private _proxyPlaceholderStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get proxyPlaceholderStream() {
    return this._proxyPlaceholderStream;
  }
  
  @ViewChild('formatObjectEditor')
  private _formatObjectEditor: FormatObjectEditorComponent;
  
  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    protected NavigationService: NavigationService,
    private itemRepository: ItemRepository,
    public MatDialogRef: MatDialogRef<CreateWizardComponent>) {
    super(NavigationService);
  }

  ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._parentId = this.data['parentId'];
    }
    
    this._proxyPlaceholderStream.next(this.buildProxyPlaceholder());
  }
  
  public isDialogInstance(): boolean {
    return this.MatDialogRef && (this.MatDialogRef.componentInstance ===
      this) && this.data;
  }
  
  private buildProxyPlaceholder(): any {
    let modelProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'Item');
    let proxyPlaceholder: any = {
      kind: 'Item',
      item: {
        parentId: this._parentId
      },
      model: modelProxy
    };

    return proxyPlaceholder;
  }

  createItem() {
    this._isDisabled = true;
    let itemProxyPlaceholder: any = this.proxyPlaceholderStream.getValue();
    this.itemRepository.upsertItem(this._formatObjectEditor.selectedType.name,
      itemProxyPlaceholder.item).then(() => {
        console.log('Build Item promise resolve');
        this.MatDialogRef.close();
      }, (error) => {
        // TODO show error on review stepper
        this.errorMessage = error;
        console.log(error);
      });

  }

  cancel() {
    this.MatDialogRef.close();
  }

  public clearError(): void {
    this.errorMessage = undefined;
    this._isDisabled = false;
  }
}

