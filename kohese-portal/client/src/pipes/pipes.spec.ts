import { HighlightPipe } from './highlight.pipe';
import { MapKeyPipe } from './map-key.pipe';
import { SanitizeHtmlPipe } from './sanitizeHtml.pipe';
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

    it('is instantiated', inject([DomSanitizer], (sanitizer : DomSanitizer)=>{
      let pipe = new SanitizeHtmlPipe(sanitizer);
      console.log(pipe);
      expect(pipe).toBeTruthy();
      }))
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