/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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
import { MatDialogRef } from '@angular/material';
import { of as observableOf } from 'rxjs';

import { TreeConfiguration } from '../../../common/src/tree-configuration';
import { ComponentDialogComponent,
  ComponentDialogConfiguration } from '../../src/components/dialog/component-dialog/component-dialog.component';

export class MockDialogService {
  public constructor() {
  }

  public openYesNoDialog(title: string, text: string): Promise<any> {
    return Promise.resolve(true);
  }

  public openInformationDialog(title: string, text: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  public openInputDialog(title: string, text: string, type: string,
    fieldName: string, defaultValue: string, validate: (value:
    any) => boolean): Promise<any> {
    return Promise.resolve(fieldName);
  }

  public openDropdownDialog(title: string, text: string, label: string,
    defaultValue: string, validate: (value: any) => boolean, options:
    { [optionName: string]: any }): Promise<any> {
    // 20200812 - Attempting to use Object.values below failed
    return Promise.resolve(options[Object.keys(options)[0]]);
  }

  public openComponentDialog<T>(componentReference: ComponentType<T>, data:
    any): MatDialogRef<T> {
    let dialogRefPlaceholder: any = {
      'updateSize': (width: string, height: string) => {
        return dialogRefPlaceholder;
      },
      'afterClosed': () => {
        if ('TreeComponent' === componentReference.name) {
          return observableOf([TreeConfiguration.getWorkingTree().
            getRootProxy()]);
        }
      }
    };

    return dialogRefPlaceholder;
  }

  public openComponentsDialog(componentDialogConfigurations:
    Array<ComponentDialogConfiguration>, dialogConfiguration: any):
    MatDialogRef<ComponentDialogComponent> {
    let matDialogRefPlaceholder: MatDialogRef<ComponentDialogComponent> = ({
      'updateSize': (width: string, height: string) => {
        return matDialogRefPlaceholder;
      },
      'afterClosed': () => {
        return observableOf(componentDialogConfigurations);
      }
    } as MatDialogRef<ComponentDialogComponent>);

    return matDialogRefPlaceholder;
  }
}
