import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Optional, Inject } from '@angular/core';

@Component({
  selector: 'table-column-selector',
  templateUrl: './table-column-selector.component.html',
  styleUrls: ['./table-column-selector.component.scss']
})
export class TableColumnSelectorComponent implements OnInit {
  selectedField: string;

  constructor(private dialogRef: MatDialogRef<TableColumnSelectorComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) private data: any) { }

  ngOnInit() {
    console.log(this);
  }

  close(confirmChoice: boolean) {
    if (confirmChoice) {
      this.dialogRef.close(this.selectedField);
    } else {
      this.dialogRef.close();
    }
  }

  selectField(fieldEvent: any) {
    this.selectedField = fieldEvent.value;
  }

}
