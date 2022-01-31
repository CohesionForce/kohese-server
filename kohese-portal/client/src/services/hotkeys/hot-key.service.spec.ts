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
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

// Other External Dependencies

// Kohese
import { Hotkeys } from './hot-key.service';
import { DialogService } from '../dialog/dialog.service';
import { MockDialogService } from '../../../../client/mocks/services/MockDialogService';

describe('HotKeyService', () => {
  let service: Hotkeys;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
      ]
    });
    service = TestBed.inject(Hotkeys);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should detect a new shortcut', fakeAsync(() => {
    let shortcut = { keys: 'control.s', description: 'save and continue' };

    service.addShortcut(shortcut).subscribe((command) => {});

    tick();
    expect(service.hotkeys.get(shortcut.keys)).toContain('save and continue');
  }));

  // it shouldn't cause a problem if we don't have the shortcut that is called

  // it might should remove a shortcut for context sensitivity

  // it should replace an existing shortcut callback
});
