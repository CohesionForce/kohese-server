import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input, ViewChild, Output, EventEmitter, OnInit,
  OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemCache } from '../../../../../common/src/item-cache';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { Comparison } from '../comparison.class';
import { DetailsFormComponent } from '../../details/details-form/details-form.component';
import { ProxySelectorDialogComponent } from '../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';

class ScrollbarPositionPercentages {
  public constructor(public vertical: number, public horizontal: number) {
  }
}

@Component({
  selector: 'comparison-side',
  templateUrl: './comparison-side.component.html',
  styleUrls: ['./compare-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonSideComponent implements OnInit, OnDestroy {
  private _isBaseVersion: boolean = true;
  get isBaseVersion() {
    return this._isBaseVersion;
  }
  @Input('isBaseVersion')
  set isBaseVersion(isBaseVersion: boolean) {
    this._isBaseVersion = isBaseVersion;
  }

  private _propertyDifferenceMap: Map<string, Array<any>> =
    new Map<string, Array<any>>();
  get propertyDifferenceMap() {
    return this._propertyDifferenceMap;
  }

  private _selectedObjectSubject: BehaviorSubject<ItemProxy> =
    new BehaviorSubject<ItemProxy>(undefined);
  get selectedObjectSubject() {
    return this._selectedObjectSubject;
  }

  private _sideChangeable: boolean = true;
  get sideChangeable() {
    return this._sideChangeable;
  }
  @Input('sideChangeable')
  set sideChangeable(sideChangeable: boolean) {
    this._sideChangeable = sideChangeable;
  }

  private _type: KoheseType;
  get type() {
    return this._type;
  }

  private _allowEditing: boolean = false;
  get allowEditing() {
    return this._allowEditing;
  }

  private _editableSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  get editableSubject() {
    return this._editableSubject;
  }
  @Input('editable')
  set editable(editable: boolean) {
    this._editableSubject.next(editable);
  }

  private _selectedVersion: string;
  get selectedVersion() {
    return this._selectedVersion;
  }

  private _versions: Array<any> = [];
  get versions() {
    return this._versions;
  }

  private _showDifferencesOnlySubject: BehaviorSubject<boolean>;
  get showDifferencesOnlySubject() {
    return this._showDifferencesOnlySubject;
  }
  @Input('showDifferencesOnlySubject')
  set showDifferencesOnlySubject(showDifferencesOnlySubject:
    BehaviorSubject<boolean>) {
    this._showDifferencesOnlySubject = showDifferencesOnlySubject;
  }

  get Array() {
    return Array;
  }

  @ViewChild('detailsForm')
  private _detailsFormComponent: DetailsFormComponent;
  private _element: any;

  @Output()
  public scrolled: EventEmitter<ScrollbarPositionPercentages> =
    new EventEmitter<ScrollbarPositionPercentages>();
  private _scrollDelayIdentifier: any;

  private _treeConfigurationSubscription: Subscription;
  private _changeSubjectSubscription: Subscription;

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository, private _dialogService:
    DialogService) {
  }

  public ngOnInit(): void {
    this._treeConfigurationSubscription = this._itemRepository.getTreeConfig().
      subscribe((treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        if (this._changeSubjectSubscription) {
          this._changeSubjectSubscription.unsubscribe();
        }

        this._changeSubjectSubscription = treeConfigurationObject.config.
          getChangeSubject().subscribe((notification: any) => {
          if (notification.proxy) {
            let selectedObject: any = this._selectedObjectSubject.getValue();
            if (selectedObject && (selectedObject as ItemProxy).item.id ===
              notification.proxy.item.id) {
              // Do not update if a non-editable version is selected
              if (this._allowEditing) {
                this.whenSelectedObjectChanges(selectedObject).subscribe();
              }
            }
          }
          });
      }
      });
  }

  public ngOnDestroy(): void {
    if (this._changeSubjectSubscription) {
      this._changeSubjectSubscription.unsubscribe();
    }

    this._treeConfigurationSubscription.unsubscribe();
  }

  public whenSelectedObjectChanges(object: ItemProxy): Observable<Array<any>> {
    return this._itemRepository.getHistoryFor(object).map((history:
      Array<any>) => {
      this._versions = history;
      if (!object.status['Unstaged'] && (this._versions.length > 0)) {
        /* If there are no unstaged changes to the selected Item, change the
        commit ID of the most recent commit that included that Item to
        'Unstaged' to operate on the working tree version of that Item. */
        this._versions[0].commit = 'Unstaged';
      }
      let uncommittedVersions: Array<any> = [];
      for (let statusName in object.status) {
        uncommittedVersions.push({
          commit: statusName,
          message: statusName
        });
      }
      this._versions.splice(0, 0, ...uncommittedVersions);
      this.whenSelectedVersionChanges(object, 'Unstaged');

      return this._versions;
    });
  }

  public whenSelectedVersionChanges(object: any, versionIdentifier: string):
    void {
    this._selectedVersion = versionIdentifier;
    this._allowEditing = (('Staged' === versionIdentifier) || (this.
      _versions[0].commit === versionIdentifier));
    this._type = object.model.type;
    this._propertyDifferenceMap.clear();
    for (let propertyName in this._type.fields) {
      let view: any = this._type.fields[propertyName].views['form'];
      if (view) {
        this._propertyDifferenceMap.set(propertyName, []);
      }
    }
    this._selectedObjectSubject.next(this.getVersionProxy(versionIdentifier,
      (object as ItemProxy).item.id));
    this._changeDetectorRef.detectChanges();

    if (this._element) {
      this._element.onscroll = (scrollEvent: any) => {
        if (this._scrollDelayIdentifier) {
          clearTimeout(this._scrollDelayIdentifier);
        }

        this._scrollDelayIdentifier = setTimeout(() => {
          let currentScrollTop: number = this._element.scrollTop;
          let percentHeightScrolled: number = currentScrollTop / (this.
            _element.scrollHeight - this._element.offsetHeight);

          let currentScrollLeft: number = this._element.scrollLeft;
          let percentWidthScrolled: number = currentScrollLeft /
            (this._element.scrollWidth - this._element.offsetWidth);

          this.scrolled.emit(new ScrollbarPositionPercentages(
            percentHeightScrolled, percentWidthScrolled));

          this._scrollDelayIdentifier = undefined;
        }, 150);
      }
    }
  }

  public getComparisonValue(propertyName: string):
    string {
    let selectedObject: any = this._selectedObjectSubject.getValue();
    let value: any = undefined;
    if (selectedObject) {
      value = (selectedObject as ItemProxy).item[propertyName];
      if (null == value) {
        value = '';
      }

      value = String(value);
      if (Comparison.UUID_REGULAR_EXPRESSION.test(value)) {
        let proxy: ItemProxy = TreeConfiguration.getTreeConfigFor(
          this._selectedVersion).getProxyFor(value);
        if (proxy) {
          value = 'Reference to ' + proxy.item.name + ' (' + proxy.item.id +
            ')';
        }
      }
    }

    return value;
  }

  public scroll(scrollbarPositionPercentages: ScrollbarPositionPercentages):
    void {
    this._element.scrollTop = scrollbarPositionPercentages.vertical * (this.
      _element.scrollHeight - this._element.offsetHeight);
    this._element.scrollLeft = scrollbarPositionPercentages.horizontal * (this.
      _element.scrollWidth - this._element.offsetWidth);
  }

  public saveCurrentProxy(): void {
    let proxy: ItemProxy = this._selectedObjectSubject.getValue();
    let item: any = this._detailsFormComponent.formGroup.value;
    for (let fieldName in item) {
      proxy.item[fieldName] = item[fieldName];
    }
    let fieldNames: Array<string> = Array.from(this._detailsFormComponent.
      nonFormFieldMap.keys());
    for (let j: number = 0; j < fieldNames.length; j++) {
      proxy.item[fieldNames[j]] = this._detailsFormComponent.nonFormFieldMap.
        get(fieldNames[j]);
    }

    this._itemRepository.upsertItem(proxy).then((returnedProxy: ItemProxy) => {
      this._editableSubject.next(false);
    });
  }

  public toggleEditability(): void {
    let editable: boolean = !this._editableSubject.getValue();
    this._editableSubject.next(editable);
    if (!editable) {
      // If editing was canceled, reset the object
      this._itemRepository.fetchItem(this._selectedObjectSubject.getValue()).then(
        (proxy: ItemProxy) => {
          this.whenSelectedObjectChanges(proxy).subscribe();
        });
    }
  }

  public openProxySelectionDialog(): void {
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        selected: this._selectedObjectSubject.getValue(),
        allowMultiSelect : false
      }
    }).updateSize('70%', '70%').afterClosed().subscribe((selection: any) => {
      if (selection) {
        this.whenSelectedObjectChanges(selection).subscribe();
      }
    });
  }

  public refresh(): void {
    this._changeDetectorRef.markForCheck();
  }

  public setColors(difference: any): object {
    let style: object = {};
    if (difference.added && !this._isBaseVersion) {
      style = {
        'background-color': 'lightgreen',
        'color': 'darkgreen'
      };
    } else if (difference.removed && this._isBaseVersion) {
      style = {
        'background-color': 'lightcoral',
        'color': 'darkred'
      };
    }

    return style;
  }

  private getVersionProxy(versionIdentifier: string, itemId: string):
    ItemProxy {
    let treeConfiguration: TreeConfiguration =
      TreeConfiguration.getTreeConfigFor(versionIdentifier);
    if (!treeConfiguration) {
      treeConfiguration = new TreeConfiguration(versionIdentifier);
      let itemCache: ItemCache = TreeConfiguration.getItemCache();
      itemCache.loadProxiesForCommit(versionIdentifier, treeConfiguration);
      treeConfiguration.loadingComplete();
    }

    return treeConfiguration.getProxyFor(itemId);
  }
}
