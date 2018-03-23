import { Component, Optional, Inject, Input, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, AfterViewChecked, ViewChild,
  ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ItemProxy } from '../../../../common/src/item-proxy';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'compare-items',
  templateUrl: './compare-items.component.html',
  styleUrls: ['./compare-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareItemsComponent implements OnInit, AfterViewChecked {
  private _baseProxyStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get baseProxyStream() {
    return this._baseProxyStream;
  }
  
  private _changeProxyStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get changeProxyStream() {
    return this._changeProxyStream;
  }
  
  private _baseOnRight: boolean = true;
  get baseOnRight() {
    return this._baseOnRight;
  }
  set baseOnRight(baseOnRight: boolean) {
    this._baseOnRight = baseOnRight;
  }
  
  private _editableStream: BehaviorSubject<boolean>;
  get editableStream() {
    return this._editableStream;
  }
  @Input('editableStream')
  set editableStream(editableStream: BehaviorSubject<boolean>) {
    this._editableStream = editableStream;
  }
  
  get dialogParameters() {
    return this._dialogParameters;
  }
  
  @ViewChild('rightSplitArea')
  private _rightSplitArea: ElementRef;
  @ViewChild('leftSplitArea')
  private _leftSplitArea: ElementRef;
  
  public constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) private _dialogParameters: any,
    private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public ngOnInit(): void {
    if (this._dialogParameters) {
      let baseProxy: ItemProxy = this._dialogParameters['baseProxy'];
      if (baseProxy) {
        if (this._baseOnRight) {
          this.whenRightItemChanges(baseProxy);
        } else {
          this.whenLeftItemChanges(baseProxy);
        }
      }
    }
  }
  
  public ngAfterViewChecked(): void {
    let rightDetailsFormForm: any = this._rightSplitArea.nativeElement.
      getElementsByTagName('form')[0];
    let leftDetailsFormForm: any = this._leftSplitArea.nativeElement.
      getElementsByTagName('form')[0];
    
    if (rightDetailsFormForm && leftDetailsFormForm) {
      if (!rightDetailsFormForm.onscroll) {
        rightDetailsFormForm.onscroll = (scrollEvent: any) => {
          if (leftDetailsFormForm) {
            let currentScrollTop: number = rightDetailsFormForm.scrollTop;
            let percentHeightScrolled: number = currentScrollTop /
              (rightDetailsFormForm.scrollHeight - rightDetailsFormForm.
              offsetHeight);
            leftDetailsFormForm.scrollTop = percentHeightScrolled *
              (leftDetailsFormForm.scrollHeight - leftDetailsFormForm.
              offsetHeight);
        
            let currentScrollLeft: number = rightDetailsFormForm.scrollLeft;
            let percentWidthScrolled: number = currentScrollLeft /
              (rightDetailsFormForm.scrollWidth - rightDetailsFormForm.
              offsetWidth);
            leftDetailsFormForm.scrollLeft = percentWidthScrolled *
              (leftDetailsFormForm.scrollWidth - leftDetailsFormForm.
              offsetWidth);
          }
        };
      
        leftDetailsFormForm.onscroll = (scrollEvent: any) => {
          if (rightDetailsFormForm) {
            let currentScrollTop: number = leftDetailsFormForm.scrollTop;
            let percentHeightScrolled: number = currentScrollTop /
              (leftDetailsFormForm.scrollHeight - leftDetailsFormForm.
              offsetHeight);
            rightDetailsFormForm.scrollTop = percentHeightScrolled *
              (rightDetailsFormForm.scrollHeight - rightDetailsFormForm.
              offsetHeight);
        
            let currentScrollLeft: number = leftDetailsFormForm.scrollLeft;
            let percentWidthScrolled: number = currentScrollLeft /
              (leftDetailsFormForm.scrollWidth - leftDetailsFormForm.
              offsetWidth);
            rightDetailsFormForm.scrollLeft = percentWidthScrolled *
              (rightDetailsFormForm.scrollWidth - rightDetailsFormForm.
              offsetWidth);
          }
        };
      }
      
      let changeDetailsFormForm: any;
      if (this._baseOnRight) {
        changeDetailsFormForm = leftDetailsFormForm;
      } else {
        changeDetailsFormForm = rightDetailsFormForm;
      }
      
      let formFields: Array<any> = changeDetailsFormForm.querySelectorAll(
        '[ng-reflect-name]');
      for (let j: number = 0; j < formFields.length; j++) {
        let fieldId: string = formFields[j].getAttribute('ng-reflect-name');
        if (this._baseProxyStream.getValue().item[fieldId] !== this.
          _changeProxyStream.getValue().item[fieldId]) {
          formFields[j].style['background-color'] = 'darkorange';
        } else {
          formFields[j].style['background-color'] = '';
        }
      }
    }
  }
  
  public whenRightItemChanges(rightProxy: ItemProxy): void {
    if (this._baseOnRight) {
      this._baseProxyStream.next(rightProxy);
    } else {
      this._changeProxyStream.next(rightProxy);
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public whenLeftItemChanges(leftProxy: ItemProxy): void {
    if (this._baseOnRight) {
      this._changeProxyStream.next(leftProxy);
    } else {
      this._baseProxyStream.next(leftProxy);
    }
    
    this._changeDetectorRef.markForCheck();
  }
  
  public save(): void {
  }
}