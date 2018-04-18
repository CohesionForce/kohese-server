import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserInput } from '../user-input.class';
import * as ItemProxy from '../../../../../common/src/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { TreeComponent } from '../../tree/tree.component';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/startWith';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ProxySelectorDialogComponent } from './proxy-selector-dialog/proxy-selector-dialog.component';

@Component({
  selector: 'k-proxy-selector',
  templateUrl: './k-proxy-selector.component.html',
  styleUrls: ['./k-proxy-selector.component.scss']
})
export class KProxySelectorComponent extends UserInput
  implements OnInit, OnDestroy {
  @Input()
  public type: string;
  @Input()
  public allowMultiSelect: boolean;
  @Input()
  public useAdvancedSelector: boolean;
  public selectedProxies: Array<ItemProxy> = [];
  public selectedProxy: ItemProxy;
  @Input()
  editableStream: Observable<boolean>;
  editableStreamSub: Subscription;
  editable: boolean;
  initialized: boolean = false;

  treeConfigSub: Subscription;
  treeConfig: any;

  constructor(private ItemRepository: ItemRepository,
    private dialogService: DialogService) {
    super();
  }

  ngOnInit(): void {
    this.editableStreamSub = this.editableStream.subscribe((editable) => {
      this.editable = editable;
    })

    this.treeConfigSub = this.ItemRepository.getTreeConfig().subscribe((newConfig) => {
      if (newConfig) {
        this.treeConfig = newConfig;
      }
    })

    this.initSelections();
    this.initialized = true;
  }

  public ngOnDestroy(): void {
    if (this.editableStreamSub) {
      this.editableStreamSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized) {
      if (changes['formGroup']) {
        this.formGroup = changes['formGroup'].currentValue;
        this.initSelections();
        console.log(this.formGroup);
      }
    }
  }

  initSelections() {
    let selected = this.formGroup.controls[this.fieldId].value;
    if (selected instanceof Array) {
      this.selectedProxies = [];
      for (let i = 0; i < selected.length; i++) {
        if (selected[i].hasOwnProperty('id')) {
          // Must be a reference
          this.selectedProxies.push(ItemProxy.getWorkingTree().getProxyFor(selected[i].id))
        } else {
          // Must be an id field insteaad of a reference
          this.selectedProxies.push(ItemProxy.getWorkingTree().getProxyFor(selected[i]))
        }
      }
    } else if (selected) {
      if (selected.hasOwnProperty('id')) {
        // Must be a reference
        this.selectedProxy = ItemProxy.getWorkingTree().getProxyFor(selected.id);
      } else {
        // Must be an id field insteaad of a reference
        this.selectedProxy = ItemProxy.getWorkingTree().getProxyFor(selected);
      }
    } else if (!selected) {
      this.selectedProxy = undefined;
      this.selectedProxies = undefined;
    }
  }

  onProxySelected(selectedEvent: MatAutocompleteSelectedEvent) {
    this.selectedProxy = this.treeConfig(selectedEvent.option.value);
  }


  getSelectedProxies(): Array<ItemProxy> {
    return this.selectedProxies;
  }

  openProxySelectionDialog(): void {
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        allowMultiSelect: this.allowMultiSelect,
        selected: (this.selectedProxy) ? this.selectedProxy : this.selectedProxies
      }
    }).updateSize('60%', '60%').afterClosed().subscribe((selected) => {
      if (selected instanceof Array) {
        let selectedIds = [];
        for (let i = 0; i < selected.length; i++) {
          selectedIds.push({ id: selected[i].item.id });
        }
        this.selectedProxies = selected;
        this.formGroup.controls[this.fieldId].setValue(selectedIds);
        this.formGroup.controls[this.fieldId].markAsDirty();
      } else if (selected) {
        this.selectedProxy = selected;
        this.formGroup.controls[this.fieldId].setValue({ id: selected.item.id });
        this.formGroup.controls[this.fieldId].markAsDirty();
        console.log(this.formGroup);
      }
    })
  }
}
