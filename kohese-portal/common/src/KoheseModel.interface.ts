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


import { Type } from './Type.interface';
import { Attribute } from './Attribute.interface';
import { FormatDefinition } from './FormatDefinition.interface';
import { TableDefinition } from './TableDefinition.interface';

export interface KoheseDataModel extends Type {
  base: string;
  idInjection: boolean;
  properties: { [attributeName: string]: Attribute };
  validations: Array<any>;
  relations: any;
  acls: Array<any>;
  methods: Array<any>;
}

export interface KoheseViewModel extends Type {
  modelName: string;
  icon: string;
  color: string;
  viewProperties: { [attributeName: string]: any };
  formatDefinitions: { [formatDefinitionId: string]: FormatDefinition };
  defaultFormatKey: { [formatDefintionType: string]: string };
  tableDefinitions: { [tableDefinitionId: string]: TableDefinition };
}
