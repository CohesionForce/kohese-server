import {
  Component, Optional, Inject, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DetailsFormComponent } from '../details/details-form/details-form.component';
import { ProxySelectorDialogComponent } from '../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
import * as ItemProxy from '../../../../common/src/item-proxy';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'compare-items',
  templateUrl: './compare-items.component.html',
  styleUrls: ['./compare-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareItemsComponent implements OnInit, OnDestroy {
  private syncLeft: boolean = false;
  private syncRight: boolean = false;

  private _selectedBaseStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get selectedBaseStream() {
    return this._selectedBaseStream;
  }

  private _selectedChangeStream: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get selectedChangeStream() {
    return this._selectedChangeStream;
  }

  private _baseOnRight: boolean = false;
  get baseOnRight() {
    return this._baseOnRight;
  }
  set baseOnRight(baseOnRight: boolean) {
    this._baseOnRight = baseOnRight;
  }

  private _allowBaseEditing: boolean = false;
  get allowBaseEditing() {
    return this._allowBaseEditing;
  }

  private _allowChangeEditing: boolean = false;
  get allowChangeEditing() {
    return this._allowChangeEditing;
  }

  private _baseEditableStream: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get baseEditableStream() {
    return this._baseEditableStream;
  }

  private _changeEditableStream: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get changeEditableStream() {
    return this._changeEditableStream;
  }

  private _selectedBaseVersion: string;
  get selectedBaseVersion() {
    return this._selectedBaseVersion;
  }

  private _selectedChangeVersion: string;
  get selectedChangeVersion() {
    return this._selectedChangeVersion;
  }

  private _baseVersions: Array<any> = [];
  get baseVersions() {
    return this._baseVersions;
  }

  private _changeVersions: Array<any> = [];
  get changeVersions() {
    return this._changeVersions;
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
  @ViewChild('baseDetailsForm')
  private _baseDetailsFormComponent: DetailsFormComponent;
  @ViewChild('changeDetailsForm')
  private _changeDetailsFormComponent: DetailsFormComponent;

  private _itemProxyChangeSubscription: Subscription;

  treeConfig: any;
  treeConfigSub: Subscription;

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
        this.whenSelectedBaseChanges(baseProxy);
      }

      if (this._dialogParameters['editable']) {
        this._allowBaseEditing = true;
        this._allowChangeEditing = true;
      }
    }
    this.treeConfigSub = this._itemRepository.getTreeConfig().subscribe((newConfig) => {
      this.treeConfig = newConfig;
      this._itemProxyChangeSubscription = this.treeConfig.getChangeSubject()
        .subscribe((notification: any) => {
          if (notification.proxy) {
            if (this._selectedBaseStream.getValue() && (this._selectedBaseStream.
              getValue().item.id === notification.proxy.item.id)) {
              this.whenSelectedBaseChanges(this._selectedBaseStream.getValue());
            }

            if (this._selectedChangeStream.getValue() && (this.
              _selectedChangeStream.getValue().item.id === notification.proxy.item.
                id)) {
              this.whenSelectedChangeChanges(this._selectedChangeStream.
                getValue());
            }
          }
        });
    })

  }

  public ngOnDestroy(): void {
    this._itemProxyChangeSubscription.unsubscribe();
    this.treeConfigSub.unsubscribe();
  }

  public whenSelectedBaseChanges(baseProxy: ItemProxy): void {
    this._itemRepository.getHistoryFor(baseProxy).subscribe(
      (history: Array<any>) => {
        this._baseVersions = history;
        if (!baseProxy.status['Unstaged'] && (this._baseVersions.length > 0)) {
          /* If there are no unstaged changes to the selected Item, change the
          commit ID of the most recent commit that included that Item to
          'Unstaged' to operate on the working tree version of that Item. */
          this._baseVersions[0].commit = 'Unstaged';
        }
        let uncommittedVersions: Array<any> = [];
        for (let statusName in baseProxy.status) {
          uncommittedVersions.push({
            commit: statusName,
            message: statusName
          });
        }
        this._baseVersions.splice(0, 0, ...uncommittedVersions);
        this._selectedBaseStream.next(baseProxy);
        this.whenSelectedBaseVersionChanges('Unstaged');
      });
  }

  public whenSelectedBaseVersionChanges(versionIdentifier: string): void {
    this._selectedBaseVersion = versionIdentifier;
    this._selectedBaseStream.next(this.getVersionProxy(versionIdentifier, this.
      _selectedBaseStream.getValue().item.id));
    this._allowBaseEditing = (('Staged' === versionIdentifier) || (this.
      _baseVersions[0].commit === versionIdentifier));
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

  public whenSelectedChangeChanges(changeProxy: ItemProxy): void {
    this._itemRepository.getHistoryFor(changeProxy).subscribe(
      (history: Array<any>) => {
        this._changeVersions = history;
        if (!changeProxy.status['Unstaged'] && (this._changeVersions.
          length > 0)) {
          /* If there are no unstaged changes to the selected Item, change the
          commit ID of the most recent commit that included that Item to
          'Unstaged' to operate on the working tree version of that Item. */
          this._changeVersions[0].commit = 'Unstaged';
        }
        let uncommittedVersions: Array<any> = [];
        for (let statusName in changeProxy.status) {
          uncommittedVersions.push({
            commit: statusName,
            message: statusName
          });
        }
        this._changeVersions.splice(0, 0, ...uncommittedVersions);
        this._selectedChangeStream.next(changeProxy);
        this.whenSelectedChangeVersionChanges('Unstaged');
      });
  }

  public whenSelectedChangeVersionChanges(versionIdentifier: string): void {
    this._selectedChangeVersion = versionIdentifier;
    this._selectedChangeStream.next(this.getVersionProxy(versionIdentifier, this.
      _selectedChangeStream.getValue().item.id));
    this._allowChangeEditing = (('Staged' === versionIdentifier) || (this.
      _changeVersions[0].commit === versionIdentifier));
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

  private getVersionProxy(versionIdentifier: string, itemId: string): ItemProxy {
    let treeConfiguration: ItemProxy.TreeConfiguration = ItemProxy.
      TreeConfiguration.getTreeConfigFor(versionIdentifier);
    if (!treeConfiguration) {
      treeConfiguration = new ItemProxy.TreeConfiguration(versionIdentifier);
      let itemCache = ItemProxy.TreeConfiguration.getItemCache();
      itemCache.loadProxiesForCommit(versionIdentifier, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    return treeConfiguration.getProxyFor(itemId);
  }

  private addScrollListener(scrollSource: any, scrollTarget: any, sourcePos: string): void {
    scrollSource.onscroll = (scrollEvent: any) => {
      if (sourcePos === 'Left') {
        setTimeout(() => {
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
        setTimeout(() => {
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
        }, 150)
      }
    }
  }

  private addFieldListeners(leftDetailsFormForm: any,
    rightDetailsFormForm: any): void {
    let baseFieldNames: Array<string> = [];
    for (let fieldName in this._selectedBaseStream.getValue().item) {
      baseFieldNames.push(fieldName);
    }

    let changeFieldNames: Array<string> = [];
    for (let fieldName in this._selectedChangeStream.getValue().item) {
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

  public toggleBaseOnRight(): void {
    this._baseOnRight = !this._baseOnRight;

    // Add the scroll and field change listeners, if appropriate
    this.whenSelectedBaseVersionChanges(this._selectedBaseVersion);
  }

  public saveCurrentProxy(proxyStream: BehaviorSubject<ItemProxy>): void {
    let proxy: ItemProxy = proxyStream.getValue();
    let detailsFormComponent: DetailsFormComponent;
    if (proxyStream === this._selectedBaseStream) {
      detailsFormComponent = this._baseDetailsFormComponent;
    } else {
      detailsFormComponent = this._changeDetailsFormComponent;
    }

    let item: any = detailsFormComponent.formGroup.value;
    for (let fieldName in item) {
      proxy.item[fieldName] = item[fieldName];
    }
    let fieldNames: Array<string> = Array.from(detailsFormComponent.
      nonFormFieldMap.keys());
    for (let j: number = 0; j < fieldNames.length; j++) {
      proxy.item[fieldNames[j]] = detailsFormComponent.nonFormFieldMap.get(
        fieldNames[j]);
    }

    this._itemRepository.upsertItem(proxy).then((returnedProxy: ItemProxy) => {
      if (proxyStream === this._selectedBaseStream) {
        this._baseEditableStream.next(false);
      } else {
        this._changeEditableStream.next(false);
      }
    });
  }

  public filterFields(showDifferencesOnly: boolean): void {
    if (showDifferencesOnly) {
      this._fieldFilterStream.next(((fieldName: string) => {
        let baseProxy: ItemProxy = this._selectedBaseStream.getValue();
        let changeProxy: ItemProxy = this._selectedChangeStream.getValue();
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
      if (editableStream === this._baseEditableStream) {
        this._itemRepository.fetchItem(this._selectedBaseStream.getValue()).then(
          (proxy: ItemProxy) => {
            this.whenSelectedBaseChanges(proxy);
          });
      } else {
        this._itemRepository.fetchItem(this._selectedChangeStream.getValue()).
          then((proxy: ItemProxy) => {
            this.whenSelectedChangeChanges(proxy);
          });
      }
    }
  }

  public openProxySelectionDialog(
    proxyStream: BehaviorSubject<ItemProxy>): void {
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        selected: proxyStream.getValue()
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        if (proxyStream === this._selectedBaseStream) {
          this.whenSelectedBaseChanges(selection);
        } else {
          this.whenSelectedChangeChanges(selection);
        }
      }
    });
  }
}
