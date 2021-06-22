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


import { PropertyDefinition } from '../../../../../../../common/src/PropertyDefinition.interface';
import { DynamicTypesService } from './../../../../../services/dynamic-types/dynamic-types.service';
import { ItemProxy } from './../../../../../../../common/src/item-proxy';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'expanded-row-column',
  templateUrl: './expanded-row-column.component.html',
  styleUrls: ['./expanded-row-column.component.scss']
})
export class ExpandedRowColumnComponent implements OnInit {
  @Input()
  editable: boolean;
  @Input()
  columnProps: Array<string>;
  @Input()
  proxy: ItemProxy;
  columnFields: Array<any> = [];

  constructor(private typeService: DynamicTypesService) {
  }

  ngOnInit() {
    const types = this.typeService.getKoheseTypes();
    const proxyType = types[this.proxy.kind];
    const fieldInfo = proxyType.fields;
    for (const idx in this.columnProps) {
      if (idx) {
        let inputType;
        if (!fieldInfo[this.columnProps[idx]] || !fieldInfo[this.columnProps[idx]].views.form) {
          console.log(this, 'read');
          inputType = 'read-only';
        } else {
          inputType = fieldInfo[this.columnProps[idx]].views.form.inputType.type;
        }
        this.columnFields.push({
          field : fieldInfo[this.columnProps[idx]],
          propertyName: this.columnProps[idx],
          inputType: inputType
        });
      }
    }
    console.log(this);
  }

}
