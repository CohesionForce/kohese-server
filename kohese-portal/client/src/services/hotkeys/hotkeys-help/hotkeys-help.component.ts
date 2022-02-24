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
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

// Other External Dependencies

// Kohese

@Component({
  selector: 'app-hotkeys-help',
  templateUrl: './hotkeys-help.component.html',
  styleUrls: ['./hotkeys-help.component.scss']
})
export class HotkeysHelpComponent implements OnInit {
  hotkeys = Array.from(this.data);

  displayedColumns: Array<string> = ['shortcut','command'];
  // rowDef: Array<string> = ['shorcut', 'command'];

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {}

}
