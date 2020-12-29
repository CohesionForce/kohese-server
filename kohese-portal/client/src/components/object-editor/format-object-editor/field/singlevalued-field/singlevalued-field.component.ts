import { ChangeDetectionStrategy, ChangeDetectorRef,
  Component } from '@angular/core';

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
    if (this.propertyDefinition.kind === 'proxy-selector') {
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
