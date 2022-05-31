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


import { HighlightPipe } from './highlight.pipe';
import { MapKeyPipe } from './map-key.pipe';
import { TruncatePipe } from './truncate.pipe';

import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { inject, TestBed } from '@angular/core/testing';

describe ('Pipes:', ()=>{
  describe('Highlight Pipe', ()=>{
    let pipe : HighlightPipe;

    beforeEach(()=>{
      pipe = new HighlightPipe();
    })

    it('returns a string when it matches a passed in filter',()=>{
      expect(false).toBeTruthy;
    })
  })
  describe('Map Key Pipe', ()=>{
    let pipe : MapKeyPipe;

    beforeEach(()=>{
      pipe = new MapKeyPipe();
    })

    it('should return the keys for a map',()=>{
      let testMap = { 'a' : '1',
                      'b' : '2',
                      'c' : '3'
                    };
      expect(pipe.transform(testMap)).toEqual(['a','b','c']);
    })
  })
  describe('Sanitize HTML Pipe', ()=>{

    beforeEach(()=>{
      TestBed
        .configureTestingModule({
          imports: [
            BrowserModule
          ]
        })
    })

  })
  describe('Truncate Pipe', ()=>{
    let pipe : TruncatePipe;

    beforeEach(()=>{
      pipe = new TruncatePipe();
    })

    it('should return a truncated string with ellipses',()=>{
      expect(pipe.transform('There are four lights', 10)).toBe('There are ...')
    })
  })
})
