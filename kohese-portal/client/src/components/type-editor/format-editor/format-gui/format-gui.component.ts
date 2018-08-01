import { DialogService } from './../../../../services/dialog/dialog.service';
import { KoheseType } from './../../../../classes/UDT/KoheseType.class';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'format-gui',
  templateUrl: './format-gui.component.html',
  styleUrls: ['./format-gui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatGuiComponent implements OnInit, OnDestroy {

  @Input()
  koheseTypeStream: Observable<KoheseType>;
  koheseTypeStreamSubscription : Subscription;
  currentType: KoheseType;

  constructor(private dialogService : DialogService, private changeRef : ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.koheseTypeStreamSubscription = this.koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this.currentType = koheseType;
      this.changeRef.markForCheck();
      console.log(this.currentType);
    });
  }

  ngOnDestroy(): void {
    this.koheseTypeStreamSubscription.unsubscribe();
  }

  addContainer () {

  }
}
