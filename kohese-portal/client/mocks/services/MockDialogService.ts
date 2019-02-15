
import {of as observableOf,  Observable } from 'rxjs';


import { TreeConfiguration } from '../../../common/src/tree-configuration';

export class MockDialogService {
  public readonly INPUT_TYPES: any = {
    TEXT: 'text',
    MULTILINE_TEXT: 'multilineText',
    DATE: 'date',
    TIME: 'time'
  };
  
  constructor () {

  }
  
  public openYesNoDialog(title: string, text: string): Observable<any> {
    return observableOf(1);
  }
  
  public openInputDialog(title: string, text: string, type: string,
    fieldName: string, initialValue: string): any {
    return {
      afterClosed: () => {
        return observableOf(fieldName);
      }
    };
  }
  
  public openSelectDialog(title: string, text: string, label: string,
    initialValue: string, options: Array<string>): any {
    return {
      afterClosed: () => {
        return observableOf(options[0]);
      }
    };
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
