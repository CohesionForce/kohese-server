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


import { MatDialogRef } from '@angular/material';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'container-selector',
  templateUrl: './container-selector.component.html',
  styleUrls: ['./container-selector.component.scss']
})
export class ContainerSelectorComponent implements OnInit, OnDestroy {
  selection : string;

  constructor(private dialogRef : MatDialogRef<ContainerSelectorComponent>) {

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm(selection) {
    this.dialogRef.close(selection);
  }
}
