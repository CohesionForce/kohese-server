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


// Angular
import { Injectable, Inject } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DOCUMENT } from "@angular/common";

// Other External Dependencies

// Kohese
import { DialogService } from '../dialog/dialog.service';
import { HotkeysHelpComponent } from '../../components/hotkeys/hotkeys-help/hotkeys-help.component';

type Options = {
  element: any;
  description: string | undefined;
  keys: string;
}

@Injectable({
  providedIn: 'root'
})
export class Hotkeys {
  hotkeys = new Map();
  defaults: Partial<Options> = {
    element: this.document
  }

  constructor(private eventManager: EventManager,
              private dialogService: DialogService,
              @Inject(DOCUMENT) private document: Document
    ) {
      // TODO: Fix Keyboard Shortcut Help Window a.k.a. HelpModal.
      //       It is located within the hotkeys-help folder.
      // this.addShortcut({ keys: '', description: 'opens the shortcut help window' }).subscribe(() => {
      //   this.openHelpModal();
      // });
  }

  addShortcut(options: Partial<Options>) {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;

    this.hotkeys.set(merged.keys, merged.description);

    return new Observable(observer => {
      const handler = (e) => {
        e.preventDefault()
        observer.next(e);
      };

      const dispose = this.eventManager.addEventListener(merged.element, event, handler);

      return () => {
        dispose();
        this.hotkeys.delete(merged.keys);
      };
    })
  }

  openHelpModal() {
    this.dialogService.openComponentDialog(HotkeysHelpComponent, {
      data: this.hotkeys
    }).updateSize('50%', '70%');
  }

}
