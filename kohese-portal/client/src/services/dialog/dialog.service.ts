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


import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ComponentType } from '@angular/cdk/portal';

import { SimpleDialogComponent } from '../../components/dialog/simple-dialog/simple-dialog.component';
import { InputDialogComponent, InputDialogKind, KindInputDialogConfiguration,
  DropdownDialogConfiguration } from '../../components/dialog/input-dialog/input-dialog.component';
import { ComponentDialogComponent, ComponentDialogConfiguration,
  ButtonLabels } from '../../components/dialog/component-dialog/component-dialog.component';

@Injectable()
export class DialogService {
  public constructor(private dialog: MatDialog) {
  }

  public openConfirmDialog(title: string, text: string): Promise<any> {
    return this.openSimpleDialog(title, text, undefined);
  }

  public openYesNoDialog(title: string, text: string): Promise<any> {
    return this.openSimpleDialog(title, text, {
      acceptLabel: 'Yes',
      cancelLabel: 'No'
    });
  }

  public openInformationDialog(title: string, text: string): Promise<any> {
    return this.openSimpleDialog(title, text, { cancelLabel: 'Close' });
  }

  public async openSimpleDialog(title: string, text: string, buttonLabels:
    ButtonLabels): Promise<any> {
    let results: Array<any> = await this.openComponentsDialog([{
      component: SimpleDialogComponent,
      matDialogData: {
        title: title,
        text: text
      }
    }], { data: { buttonLabels: buttonLabels } }).updateSize('50%', 'auto').
      afterClosed().toPromise();
    if (results) {
      return results[0];
    } else {
      return undefined;
    }
  }

  public async openInputDialog(title: string, text: string, inputDialogKind:
    InputDialogKind, fieldName: string, defaultValue: any, validate: (value:
    any) => boolean): Promise<any> {
    let kindInputDialogConfiguration: KindInputDialogConfiguration = {
      title: title,
      text: text,
      fieldName: fieldName,
      value: defaultValue,
      validate: validate,
      inputDialogKind: inputDialogKind
    };

    let results: Array<any> = await this.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: kindInputDialogConfiguration
      }
    }], { data: {} }).updateSize('40%', '250px').afterClosed().toPromise();
    if (results) {
      return results[0];
    } else {
      return undefined;
    }
  }

  public async openDropdownDialog(title: string, text: string, label: string,
    defaultValue: any, validate: (value: any) => boolean, options:
    { [optionName: string]: any}):
    Promise<any> {
    if (defaultValue == null) {
      defaultValue = Object.values(options)[0];
    }

    let dropdownDialogConfiguration: DropdownDialogConfiguration = {
      title: title,
      text: text,
      fieldName: label,
      value: defaultValue,
      validate: validate,
      options: options
    };

    let results: Array<any> = await this.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: dropdownDialogConfiguration
      }
    }], { data: {} }).updateSize('40%', 'auto').afterClosed().toPromise();
    if (results) {
      return results[0];
    } else {
      return undefined;
    }
  }

  public openComponentDialog<T>(component: ComponentType<T>,
    dialogConfiguration: any): MatDialogRef<T> {
    dialogConfiguration.disableClose = true;
    return this.dialog.open(component, dialogConfiguration);
  }

  public openComponentsDialog(componentDialogConfigurations:
    Array<ComponentDialogConfiguration>, dialogConfiguration: any):
    MatDialogRef<ComponentDialogComponent> {
    dialogConfiguration.disableClose = true;
    dialogConfiguration.data.componentDialogConfigurations =
      componentDialogConfigurations;
    return this.dialog.open(ComponentDialogComponent, dialogConfiguration);
  }
}
