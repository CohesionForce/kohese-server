import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ItemProxy } from '../../../common/src/item-proxy';

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
    return Observable.of(1);
  }
  
  public openInputDialog(title: string, text: string, type: string,
    fieldName: string, initialValue: string): any {
    return {
      afterClosed: () => {
        return Observable.of(fieldName);
      }
    };
  }
  
  public openSelectDialog(title: string, text: string, label: string,
    initialValue: string, options: Array<string>): any {
    return {
      afterClosed: () => {
        return Observable.of(options[0]);
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
          return Observable.of({
            selectedProxy: ItemProxy.getWorkingTree().getRootProxy()
          });
        }
      }
    };

    return dialogRefPlaceholder;
  }
}
