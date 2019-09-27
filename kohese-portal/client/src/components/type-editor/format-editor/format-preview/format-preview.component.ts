import { KoheseType } from './../../../../classes/UDT/KoheseType.class';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject, ElementRef } from '@angular/core';
import { FormatDefinition } from '../format-editor.component';

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
  type : KoheseType;
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
      kind : this.type.dataModelProxy.item.name,
      model: this.type.dataModelProxy,
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
    this.mockProxy[this.format.header.contents[0].propertyName.attribute] =
      'Test Header';
    for(let container of this.format.containers) {
      for(let contents of container.contents) {
        this.mockProxy.item[contents.propertyName.attribute] = defaultValues[
          contents.kind];
      }
    }
  }

}
