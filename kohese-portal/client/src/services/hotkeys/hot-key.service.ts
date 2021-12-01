import { Injectable, Inject } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DOCUMENT } from "@angular/common";
import { MatDialog } from '@angular/material/dialog';
import { HotkeysHelpComponent } from '../hotkeys/hotkeys-help/hotkeys-help.component';

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
              private dialog: MatDialog,
              @Inject(DOCUMENT) private document: Document
    ) {
      // TODO: Fix Keyboard Shortcut Help Window a.k.a. HelpModal.
      //       It is located within the hotkeys-help folder.
      this.addShortcut({ keys: '' }).subscribe(() => {
        this.openHelpModal();
      });
  }

  addShortcut(options: Partial<Options>) {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;

    merged.description && this.hotkeys.set(merged.keys, merged.description);

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
    this.dialog.open(HotkeysHelpComponent, {
      width: '500px',
      data: this.hotkeys
    });
  }

}
