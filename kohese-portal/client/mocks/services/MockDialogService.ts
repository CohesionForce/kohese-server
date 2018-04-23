import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import * as ItemProxy from '../../../common/src/item-proxy';

export class MockDialogService {
  constructor () {

  }

  public openComponentDialog(componentReference: any, data: any): any {
    let dialogRefPlaceholder: any = {
      'updateSize': (width: string, height: string) => {
        return dialogRefPlaceholder;
      },
      'afterClosed': () => {
        if ('ProxySelectorDialogComponent' === componentReference.name) {
          return Observable.of(ItemProxy.getWorkingTree().getRootProxy());
        }
      }
    };
    
    return dialogRefPlaceholder;
  }
}