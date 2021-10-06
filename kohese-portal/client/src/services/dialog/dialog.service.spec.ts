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


import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';

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
