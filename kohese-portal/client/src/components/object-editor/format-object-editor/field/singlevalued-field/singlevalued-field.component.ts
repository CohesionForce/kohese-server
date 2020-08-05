import { ChangeDetectionStrategy, ChangeDetectorRef,
  Component } from '@angular/core';

import { DialogService } from '../../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../../../services/user/session.service';
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
    SessionService) {
    super(changeDetectorRef, itemRepository, dialogService, sessionService);
  }
}
