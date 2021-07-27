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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

// NPM

// Kohese
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../../services/user/session.service';
import { NavigationService } from '../../../../../services/navigation/navigation.service';
import { DetailsComponent } from '../../../../details/details.component';
import { Field } from '../field.class';

/**
 * Displays a singlevalued attribute
 */
@Component({
  selector: 'singlevalued-field',
  templateUrl: './singlevalued-field.component.html',
  styleUrls: ['./singlevalued-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SinglevaluedFieldComponent extends Field {
  public constructor(changeDetectorRef: ChangeDetectorRef, itemRepository:
    ItemRepository, dialogService: DialogService, sessionService:
    SessionService, private navigationService: NavigationService) {
    super(changeDetectorRef, itemRepository, dialogService, sessionService);
  }

  /**
   * Returns whether the given username values are considered equal
   *
   * @param option A value option
   * @param selection The current value
   */
  public areUsernamesEqual(option: string, selection: string): boolean {
    if (!option || !selection) {
      return (!option && !selection);
    } else {
      return (option === selection);
    }
  }

  public getReferenceId(): string {
    let referenceId = undefined;
    // TODO: Need to remove matching of kind with single quotes ('') when viewModels are updated.
    if (this.propertyDefinition.kind === 'proxy-selector' || this.propertyDefinition.kind === '') {
      let reference = this.koheseObject[this.propertyDefinition.propertyName];
      if (reference.id) {
        referenceId = reference.id;
      } else {
        referenceId = reference;
      }
    }

    return referenceId;
  }

  public displayInformation(): void {
    let itemProxy = this.itemRepository.getTreeConfig().getValue().config.getProxyFor(this.getReferenceId());
    if (itemProxy) {
      this._dialogService.openComponentDialog(DetailsComponent, { data: { itemProxy: itemProxy } }).updateSize('90%', '90%');
    } else {
      this._dialogService.openInformationDialog(
        'Item not Found',
        'Item not found for: ' +
          this.itemRepository.getStringRepresentation(this.koheseObject,
            this.propertyDefinition.propertyName, undefined, (this.enclosingDataModel ? this.enclosingDataModel : this.dataModel),
            this.dataModel, this.viewModel,this.formatDefinitionType) + '.'
      );
    }

  }

}
