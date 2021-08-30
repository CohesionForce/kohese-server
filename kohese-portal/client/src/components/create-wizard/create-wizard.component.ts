/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Angular
import { Component, OnInit, Input, Optional, Inject, ViewChild, ElementRef} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { SessionService } from '../../services/user/session.service';
import { FormatDefinitionType } from '../../../../common/src/FormatDefinition.interface';
import { FormatObjectEditorComponent } from '../object-editor/format-object-editor/format-object-editor.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

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
    public MatDialogRef: MatDialogRef<CreateWizardComponent>,
    private _sessionService: SessionService) {
    super(NavigationService);
  }

  ngOnInit(): void {
    if (this.isDialogInstance()) {
      this._parentId = this.data['parentId'];
    }

    this._proxyPlaceholderStream.next(this.buildProxyPlaceholder());
  }

  public isDialogInstance(): boolean {
    return this.MatDialogRef && (this.MatDialogRef.componentInstance === this) && this.data;
  }

  private buildProxyPlaceholder(): any {
    let timestamp: number = Date.now();
    let username: string = this._sessionService.user.name;
    let modelProxy: ItemProxy = TreeConfiguration.getWorkingTree().getProxyFor(
      'Item');
    let proxyPlaceholder: any = {
      kind: 'Action',
      item: {
        parentId: this._parentId,
        createdOn: timestamp,
        createdBy: username,
        modifiedOn: timestamp,
        modifiedBy: username
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

  // cancel() {
  //   this.MatDialogRef.close();
  // }

  public clearError(): void {
    this.errorMessage = undefined;
    this._isDisabled = false;
  }
}

