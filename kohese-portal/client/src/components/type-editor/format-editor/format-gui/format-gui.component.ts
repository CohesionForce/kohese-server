import { ContainerSelectorComponent } from './container-selector/container-selector.component';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { KoheseType } from '../../../../classes/UDT/KoheseType.class';
import { Subscription ,  Observable } from 'rxjs';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { FormatDefinition } from '../format-editor.component';

@Component({
  selector: 'format-gui',
  templateUrl: './format-gui.component.html',
  styleUrls: ['./format-gui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatGuiComponent implements OnInit, OnDestroy {

  @Input()
  format : FormatDefinition
  @Input()
  kind : KoheseType

  constructor(private dialogService : DialogService, private changeRef : ChangeDetectorRef) {

  }

  ngOnInit(): void {
    console.log(this.format);
  }

  ngOnDestroy(): void {
  }

  addContainer () {
    this.dialogService.openComponentDialog(ContainerSelectorComponent, {})
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.format.containers.push({
            kind : result,
            contents : []
          })
          this.changeRef.markForCheck();
        }
      })
  }

  deleteContainer (container) {
    let idx = this.format.containers.indexOf(container)
    this.format.containers.splice(idx, 1);
  }
}
