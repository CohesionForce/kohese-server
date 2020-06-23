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
    Array<string>): Promise<any> {
    return Promise.resolve(options[0]);
  }

  public openComponentDialog<T>(componentReference: ComponentType<T>, data:
    any): MatDialogRef<T> {
    let dialogRefPlaceholder: any = {
      'updateSize': (width: string, height: string) => {
        return dialogRefPlaceholder;
      },
      'afterClosed': () => {
        if ('ProxySelectorDialogComponent' === componentReference.name) {
          return observableOf(TreeConfiguration.getWorkingTree().
            getRootProxy());
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
