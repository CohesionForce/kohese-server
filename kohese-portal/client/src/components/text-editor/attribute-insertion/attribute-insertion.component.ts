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
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// NPM

// Kohese
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { TreeComponent } from '../../tree/tree.component';

class Entry {
  get key() {
    return this._key;
  }

  get value() {
    return this._value;
  }

  public constructor(private _key: any, private _value: any) {
  }
}

export enum InsertionLocation {
  Top = 'Top', Bottom = 'Bottom'
}

export enum HeadingStyle {
  NONE = 'None', ONE = 'Heading 1', TWO = 'Heading 2', THREE = 'Heading 3',
    FOUR = 'Heading 4', FIVE = 'Heading 5', SIX = 'Heading 6', STRUCTURAL =
    'Structurally-Based'
}

export class AttributeInsertionSpecification {
  private _insertionLocation: InsertionLocation = InsertionLocation.Bottom;
  get insertionLocation() {
    return this._insertionLocation;
  }
  set insertionLocation(insertionLocation: InsertionLocation) {
    this._insertionLocation = insertionLocation;
  }

  private _types: any = {};
  get types() {
    return this._types;
  }
  set types(types: any) {
    this._types = types;
  }

  public constructor() {
  }
}

@Component({
  selector: 'attribute-insertion',
  templateUrl: './attribute-insertion.component.html',
  styleUrls: ['./attribute-insertion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeInsertionComponent {
  private _attributeInsertionSpecification: AttributeInsertionSpecification =
    new AttributeInsertionSpecification();
  get attributeInsertionSpecification() {
    return this._attributeInsertionSpecification;
  }

  private _getSourceChildren: (element: any) => Array<any> = (element:
    any) => {
    let children: Array<any> = [];
    if (element == null) {
      let typeNames: Array<string> = Object.keys(this._dynamicTypesService.
        getKoheseTypes());
      for (let j: number = 0; j < typeNames.length; j++) {
        children.push(new Entry(typeNames[j], TreeConfiguration.
          getWorkingTree().getProxyFor(typeNames[j])));
      }
    } else {
      if (element.value instanceof ItemProxy) {
        let item: any = (element.value as ItemProxy).item;
        for (let localTypeName in item.localTypes) {
          children.push(new Entry(localTypeName, item.localTypes[
            localTypeName]));
        }

        for (let attributeName in item.classProperties) {
          if (attributeName !== 'description') {
            children.push(new Entry(attributeName, attributeName));
          }
        }
      } else if (element.value instanceof Object) {
        for (let attributeName in element.value.properties) {
          children.push(new Entry(attributeName, attributeName));
        }
      }
    }

    return children;
  };
  get getSourceChildren() {
    return this._getSourceChildren;
  }

  private _getSourceText: (element: any) => string = (element: any) => {
    return (element as Entry).key;
  };
  get getSourceText() {
    return this._getSourceText;
  }

  private _getTargetChildren: (element: any) => Array<any> = (element:
    any) => {
    let children: Array<any> = [];
    if (element === this._attributeInsertionSpecification) {
      let typeKeys: Array<string> = Object.keys(this.
        _attributeInsertionSpecification.types);
      for (let j: number = 0; j < typeKeys.length; j++) {
        children.push(new Entry(typeKeys[j], this.
          _attributeInsertionSpecification.types[typeKeys[j]]));
      }
    } else {
      if (element.value.localTypes) {
        let localTypeKeys: Array<string> = Object.keys(element.value.
          localTypes);
        for (let j: number = 0; j < localTypeKeys.length; j++) {
          children.push(new Entry(localTypeKeys[j], element.value.localTypes[
            localTypeKeys[j]]));
        }
      }

      if (element.value.attributes) {
        let attributeKeys: Array<string> = Object.keys(element.value.
          attributes);
        for (let j: number = 0; j < attributeKeys.length; j++) {
          children.push(new Entry(attributeKeys[j], element.value.attributes[
            attributeKeys[j]]));
        }
      }
    }

    return children;
  };
  get getTargetChildren() {
    return this._getTargetChildren;
  }

  private _getTargetText: (element: any) => string = (element: any) => {
    return (element as Entry).key;
  };
  get getTargetText() {
    return this._getTargetText;
  }

  @ViewChild('targetTree', {static: false}) 'targetTree' !: ElementRef;
  private _targetTree: TreeComponent;

  get changeDetectorRef() {
    return this._changeDetectorRef;
  }

  get matDialogRef() {
    return this._matDialogRef;
  }

  get Object() {
    return Object;
  }

  get InsertionLocation() {
    return InsertionLocation;
  }

  get HeadingStyle() {
    return HeadingStyle;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef:
    MatDialogRef<AttributeInsertionComponent>, private _dynamicTypesService:
    DynamicTypesService) {
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public addAttribute(treePath: Array<any>): void {
    let types: any = this._attributeInsertionSpecification.types;
    if (!types[treePath[0].key]) {
      types[treePath[0].key] = {
        localTypes: {
        },
        attributes: {
        }
      };
    }

    if (treePath.length > 1) {
      let typeValue: any = types[treePath[0].key];
      if (treePath[1].value instanceof Object) {
        if (!typeValue.localTypes[treePath[1].key]) {
          typeValue.localTypes[treePath[1].key] = {
            attributes: {
            }
          };
        }

        if (treePath.length > 2) {
          typeValue.localTypes[treePath[1].key].attributes[treePath[2].key] = {
            showAttributeName: false,
            linkToItem: (treePath[2].key === 'name' ? false : undefined),
            headingStyle: (treePath[2].key === 'name' ? HeadingStyle.
              STRUCTURAL : undefined)
          };
        }
      } else {
        typeValue.attributes[treePath[1].key] = {
          showAttributeName: false,
          linkToItem: (treePath[1].key === 'name' ? false : undefined),
          headingStyle: (treePath[1].key === 'name' ? HeadingStyle.STRUCTURAL :
            undefined)
        };
      }
    }

    this._attributeInsertionSpecification.types = types;
    this._targetTree.update(true);
    this._changeDetectorRef.markForCheck();
  }

  public removeAttribute(treePath: Array<any>): void {
    let types: any = this._attributeInsertionSpecification.types;
    if (treePath.length > 1) {
      if (treePath.length > 2) {
        delete types[treePath[0].key].localTypes[treePath[1].key].attributes[
          treePath[2].key];
      } else {
        if (treePath[1].value.attributes) {
          delete types[treePath[0].key].localTypes[treePath[1].key];
        } else {
          delete types[treePath[0].key].attributes[treePath[1].key];
        }
      }
    } else {
      delete types[treePath[0].key];
    }

    this._targetTree.update(true);
    this._changeDetectorRef.markForCheck();
  }
}
