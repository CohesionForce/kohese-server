import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material';

import { InputDialogKind } from '../../components/dialog/input-dialog/input-dialog.component';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let dialogService: DialogService = new DialogService({
    open: (component: ComponentType<any>, dialogConfiguration: any) => {
     return this;
    }
  } as any as MatDialog);

  it('displays a confirmation dialog', () => {
    expect(dialogService.openConfirmDialog('', '')).toBeTruthy();
  });

  it('displays a "Yes/No" dialog', () => {
    expect(dialogService.openYesNoDialog('', '')).toBeTruthy();
  });

  it('displays an informational dialog', () => {
    expect(dialogService.openInformationDialog('', '')).toBeTruthy();
  });

  it('displays an input dialog', () => {
    expect(dialogService.openInputDialog('', '', InputDialogKind.BOOLEAN, '',
      true, (value: any) => {
      return true;
    })).toBeTruthy();
  });
});
