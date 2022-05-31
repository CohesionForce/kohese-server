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


import { ValidPropertyPipe } from './valid-property.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapKeyPipe } from './map-key.pipe';
import { HighlightPipe } from './highlight.pipe';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  declarations: [
    MapKeyPipe,
    HighlightPipe,
    TruncatePipe,
    ValidPropertyPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MapKeyPipe,
    HighlightPipe,
    TruncatePipe,
    ValidPropertyPipe
  ]
})
export class PipesModule {}
