import { of as observableOf } from 'rxjs';

import { TreeConfiguration } from '../../../common/src/tree-configuration';

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

  public openComponentDialog(componentReference: any, data: any): any {
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
}
