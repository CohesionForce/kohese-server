import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DialogService,
  DialogComponent } from '../../../services/dialog/dialog.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';

@Component({
  selector: 'format-editor',
  templateUrl: './format-editor.component.html',
  styleUrls: ['./format-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatEditorComponent implements OnInit, OnDestroy {

  @Input()
  koheseTypeStream: Observable<KoheseType>;
  koheseTypeStreamSubscription : Subscription;
  currentType: KoheseType;
  idProperties: any = {};
  selectedPropertyId: string;
  types = [];

  constructor(private typeService : DynamicTypesService, private changeRef : ChangeDetectorRef) {

  }

  ngOnInit(): void {
    let koheseTypes: any = this.typeService.getKoheseTypes();
    for (let type in koheseTypes) {
      this.types[type] = type;
      for (let propertyName in koheseTypes[type].dataModelProxy.item.properties) {
        if (koheseTypes[type].dataModelProxy.item.properties[propertyName].id) {
          if (!this.idProperties[type]) {
            this.idProperties[type] = [];
          }

          this.idProperties[type].push(propertyName);
        }
      }
    }
    this.koheseTypeStreamSubscription = this.koheseTypeStream.subscribe(
      (koheseType: KoheseType) => {
      this.currentType = koheseType;
      this.changeRef.markForCheck();
    });
  }

  public ngOnDestroy(): void {
    this.koheseTypeStreamSubscription.unsubscribe();
  }
}
