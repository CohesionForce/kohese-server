import { Component } from '@angular/core';

@Component({
  selector : 'markdown-cheat',
  templateUrl: './markdown-cheat-sheet.component.html',
  styles : [`
    .markdown-reference {
      width: 100%;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #E1E1E1
    }
  `]
})
export class MarkdownCheatSheetComponent {
  constructor () {

  }
}