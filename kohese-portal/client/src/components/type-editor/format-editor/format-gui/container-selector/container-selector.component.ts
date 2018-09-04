import { MatDialogRef } from '@angular/material';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'container-selector',
  templateUrl: './container-selector.component.html',
  styleUrls: ['./container-selector.component.scss']
})
export class ContainerSelectorComponent implements OnInit, OnDestroy {
  selection : string;

  constructor(private dialogRef : MatDialogRef<ContainerSelectorComponent>) {

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  confirm(selection) {
    this.dialogRef.close(selection);
  }
}
