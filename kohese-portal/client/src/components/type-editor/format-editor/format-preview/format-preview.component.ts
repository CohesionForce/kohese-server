import { MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject } from '@angular/core';
import { FormatDefinition } from '../format-editor.component';

@Component({
  selector: 'format-preview',
  templateUrl: './format-preview.component.html',
  styleUrls: ['./format-preview.component.scss']
})
export class FormatPreviewComponent implements OnInit {
  format : FormatDefinition;

  constructor(@Inject(MAT_DIALOG_DATA) private data: any) {
    this.format = data.format
  }

  ngOnInit() {
    
  }

}
