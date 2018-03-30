import { Component, Optional, Inject, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { ProxySelectorDialogComponent } from '../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
import { ItemProxy } from '../../../../common/src/item-proxy';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'compare-items',
  templateUrl: './compare-items.component.html',
  styleUrls: ['./compare-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareItemsComponent implements OnInit {
  private syncLeft : boolean = false;
  private syncRight : boolean = false;

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
  
  private _baseOnRight: boolean = false;
  get baseOnRight() {
    return this._baseOnRight;
  }
  set baseOnRight(baseOnRight: boolean) {
    this._baseOnRight = baseOnRight;
  }
  
  private _allowEditing: boolean = false;
  get allowEditing() {
    return this._allowEditing;
  }
  private _baseItemEditableStream: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get baseItemEditableStream() {
    return this._baseItemEditableStream;
  }
  
  private _changeItemEditableStream: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get changeItemEditableStream() {
    return this._changeItemEditableStream;
  }
  
  private _fieldFilterStream: BehaviorSubject<((fieldName: string) => boolean)> =
    new BehaviorSubject<((fieldName: string) => boolean)>(
    ((fieldName: string) => {
    return true;
  }));
  get fieldFilterStream() {
    return this._fieldFilterStream;
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
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogService: DialogService,
    private _itemRepository: ItemRepository) {
  }
  
  public ngOnInit(): void {
    if (this._dialogParameters) {
      let baseProxy: ItemProxy = this._dialogParameters['baseProxy'];
      if (baseProxy) {
        this.whenBaseProxyChanges(baseProxy);
      }
      
      if (this._dialogParameters['editable']) {
        this._allowEditing = true;
      }
    }
  }
  
  public whenBaseProxyChanges(baseProxy: ItemProxy): void {
    this._baseProxyStream.next(baseProxy);
    this._changeDetectorRef.detectChanges();
    let rightDetailsFormForm: any = this._rightSplitArea.nativeElement.
      getElementsByTagName('form')[0];
    let leftDetailsFormForm: any = this._leftSplitArea.nativeElement.
      getElementsByTagName('form')[0];
    if (rightDetailsFormForm && leftDetailsFormForm) {
      this.addScrollListener(rightDetailsFormForm, leftDetailsFormForm, 'Left');
      this.addScrollListener(leftDetailsFormForm, rightDetailsFormForm, 'Right');
      this.addFieldListeners(leftDetailsFormForm, rightDetailsFormForm);
    }
  }
  
  public whenChangeProxyChanges(changeProxy: ItemProxy): void {
    this._changeProxyStream.next(changeProxy);
    this._changeDetectorRef.detectChanges();
    let rightDetailsFormForm: any = this._rightSplitArea.nativeElement.
      getElementsByTagName('form')[0];
    let leftDetailsFormForm: any = this._leftSplitArea.nativeElement.
      getElementsByTagName('form')[0];
    if (rightDetailsFormForm && leftDetailsFormForm) {
      this.addScrollListener(rightDetailsFormForm, leftDetailsFormForm, 'Left');
      this.addScrollListener(leftDetailsFormForm, rightDetailsFormForm, 'Right');
      this.addFieldListeners(leftDetailsFormForm, rightDetailsFormForm);
    }
  }
  
  private addScrollListener(scrollSource: any, scrollTarget: any, sourcePos : string): void {
    scrollSource.onscroll = (scrollEvent: any) => {
      if (sourcePos === 'Left') {
      setTimeout(()=>{
        if (!this.syncLeft) {
          this.syncRight = true;
          let currentScrollTop: number = scrollSource.scrollTop;
          let percentHeightScrolled: number = currentScrollTop /
            (scrollSource.scrollHeight - scrollSource.
            offsetHeight);
          scrollTarget.scrollTop = percentHeightScrolled *
            (scrollTarget.scrollHeight - scrollTarget.
            offsetHeight);
          
          let currentScrollLeft: number = scrollSource.scrollLeft;
          let percentWidthScrolled: number = currentScrollLeft /
            (scrollSource.scrollWidth - scrollSource.
            offsetWidth);
          scrollTarget.scrollLeft = percentWidthScrolled *
            (scrollTarget.scrollWidth - scrollTarget.
            offsetWidth);
        }
        this.syncLeft = false;
      }, 150);
    } else if (sourcePos === 'Right') {
      setTimeout(()=>{
        if (!this.syncRight) {
          this.syncLeft = true;
          let currentScrollTop: number = scrollSource.scrollTop;
          let percentHeightScrolled: number = currentScrollTop /
            (scrollSource.scrollHeight - scrollSource.
            offsetHeight);
          scrollTarget.scrollTop = percentHeightScrolled *
            (scrollTarget.scrollHeight - scrollTarget.
            offsetHeight);
          
          let currentScrollLeft: number = scrollSource.scrollLeft;
          let percentWidthScrolled: number = currentScrollLeft /
            (scrollSource.scrollWidth - scrollSource.
            offsetWidth);
          scrollTarget.scrollLeft = percentWidthScrolled *
            (scrollTarget.scrollWidth - scrollTarget.
            offsetWidth);
        }
        this.syncRight = false;
      }, 150)}
    }
  }
  
  private addFieldListeners(leftDetailsFormForm: any,
    rightDetailsFormForm: any): void {
    let baseFieldNames: Array<string> = [];
    for (let fieldName in this._baseProxyStream.getValue().item) {
      baseFieldNames.push(fieldName);
    }
    
    let changeFieldNames: Array<string> = [];
    for (let fieldName in this._changeProxyStream.getValue().item) {
      changeFieldNames.push(fieldName);
    }
    
    let commonFieldNames: Array<string> = [];
    if (baseFieldNames.length > changeFieldNames.length) {
      for (let j: number = 0; j < baseFieldNames.length; j++) {
        if (-1 !== changeFieldNames.indexOf(baseFieldNames[j])) {
          commonFieldNames.push(baseFieldNames[j]);
        }
      }
    } else {
      for (let j: number = 0; j < changeFieldNames.length; j++) {
        if (-1 !== baseFieldNames.indexOf(changeFieldNames[j])) {
          commonFieldNames.push(changeFieldNames[j]);
        }
      }
    }

    let baseDetailsFormForm: any;    
    let changeDetailsFormForm: any;
    if (this._baseOnRight) {
      baseDetailsFormForm = rightDetailsFormForm;
      changeDetailsFormForm = leftDetailsFormForm;
    } else {
      changeDetailsFormForm = rightDetailsFormForm;
      baseDetailsFormForm = leftDetailsFormForm;
    }
    
    let baseFormFieldMap: Map<string, any> = new Map<string, any>();
    let baseFormFields: Array<any> = baseDetailsFormForm.querySelectorAll(
      '[ng-reflect-name]');
    for (let j: number = 0; j < baseFormFields.length; j++) {
      let fieldName: string = baseFormFields[j].getAttribute(
        'ng-reflect-name');
      if (-1 !== commonFieldNames.indexOf(fieldName)) {
        baseFormFieldMap.set(fieldName, baseFormFields[j]);
      }
    }
    
    let changeFormFields: Array<any> = changeDetailsFormForm.querySelectorAll(
      '[ng-reflect-name]');
    for (let j: number = 0; j < changeFormFields.length; j++) {
      let fieldName: string = changeFormFields[j].getAttribute(
        'ng-reflect-name');
      if (-1 !== commonFieldNames.indexOf(fieldName)) {
        changeFormFields[j].onchange = (changeEvent: any) => {
          if (baseFormFieldMap.get(fieldName).value !== changeFormFields[j].
            value) {
            changeFormFields[j].style['background-color'] = 'darkorange';
          } else {
            changeFormFields[j].style['background-color'] = '';
          }
        };
        
        changeFormFields[j].onchange();
        baseFormFieldMap.get(fieldName).onchange = (changeEvent: any) => {
          changeFormFields[j].onchange();
        };
      }
    }
  }
  
  public save(proxy: ItemProxy): void {
    this._itemRepository.upsertItem(proxy);
  }
  
  public filterFields(showDifferencesOnly: boolean): void {
    if (showDifferencesOnly) {
      this._fieldFilterStream.next(((fieldName: string) => {
        let baseProxy: ItemProxy = this._baseProxyStream.getValue();
        let changeProxy: ItemProxy = this._changeProxyStream.getValue();
        if (baseProxy && changeProxy && (baseProxy.item[fieldName] ===
          changeProxy.item[fieldName])) {
          return false;
        } else {
          return true;
        }
      }));
    } else {
      this._fieldFilterStream.next(((fieldName: string) => {
        return true;
      }));
    }
  }
  
  public toggleEditability(editableStream: BehaviorSubject<boolean>): void {
    let editable: boolean = !editableStream.getValue();
    editableStream.next(editable);
    if (!editable) {
      // If editing was canceled, reset the appropriate ItemProxy
      if (editableStream === this._baseItemEditableStream) {
        this._itemRepository.fetchItem(this._baseProxyStream.getValue()).then(
          (proxy: ItemProxy) => {
          this.whenBaseProxyChanges(proxy);
        });
      } else {
        this._itemRepository.fetchItem(this._changeProxyStream.getValue()).
          then((proxy: ItemProxy) => {
          this.whenChangeProxyChanges(proxy);
        });
      }
    }
  }
  
  public openProxySelectionDialog(
    proxyStream: BehaviorSubject<ItemProxy>): void {
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      selected: proxyStream.getValue()
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        if (proxyStream === this._baseProxyStream) {
          this.whenBaseProxyChanges(selection);
        } else {
          this.whenChangeProxyChanges(selection);
        }
      }
    });
  }
}