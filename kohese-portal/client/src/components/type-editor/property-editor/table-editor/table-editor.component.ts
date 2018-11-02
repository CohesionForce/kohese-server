import { DialogService } from './../../../../services/dialog/dialog.service';
import { Component, OnInit } from '@angular/core';
import { ProxyTableComponent } from '../../../user-input/k-proxy-selector/proxy-table/proxy-table.component';

@Component({
  selector: 'table-editor',
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.scss']
})
export class TableEditorComponent implements OnInit {

  constructor(private dialogService : DialogService) { }

  ngOnInit() {

  }

  openTablePreview() {
      this.dialogService.openComponentDialog(ProxyTableComponent, {
        data: {}
      }).updateSize('60%', '60%').afterClosed().subscribe((selected : any) => {
    })
    }
}
