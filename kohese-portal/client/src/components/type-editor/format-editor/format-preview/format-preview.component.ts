/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject, ElementRef } from '@angular/core';
import { FormatDefinition } from '../../../../../../common/src/FormatDefinition.interface';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';

let textDefault = 'Example Text'

const defaultValues = {
  'text' : textDefault,
  'date' : 1507037549556,
  'markdown' : textDefault,
  'select' : 'Example Option',
  'user-selector' : 'testUser',
  'read-only' : textDefault
}

@Component({
  selector: 'format-preview',
  templateUrl: './format-preview.component.html',
  styleUrls: ['./format-preview.component.scss']
})
export class FormatPreviewComponent implements OnInit {
  format : FormatDefinition;
  type : any;
  mockRow = {
    editable : false
  }
  // Temporary Impl
  private mockProxy: any;

  mockDocInfo : any;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.format = data.format
    this.type = data.type
  }

  ngOnInit() {
    console.log(this.format);
    this.mockProxy = {
      item : {
        name : 'Test Header',
        description : "This is an example description"
      },
      kind : this.type.name,
      model: TreeConfiguration.getWorkingTree().getProxyFor(this.type.id),
      relations: {
        references: {},
        referencedBy: {}
      }
    }

    this.addFields();

    this.mockDocInfo = {
      format : this.format,
      proxy : this.mockProxy
    };
  }

  addFields() {
    this.mockProxy[this.format.header.contents[0].propertyName] =
      'Test Header';
    for(let container of this.format.containers) {
      for(let contents of container.contents) {
        this.mockProxy.item[contents.propertyName] = defaultValues[contents.
          kind];
      }
    }
  }

}
