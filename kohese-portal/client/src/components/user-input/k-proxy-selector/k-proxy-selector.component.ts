import { Component, Input, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserInput } from '../user-input.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { Observable ,  Subscription } from 'rxjs';

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
  public selected : any;
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
        this.treeConfig = newConfig.config;
        this.initSelections();
      }
    })

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
    if (this.allowMultiSelect) {
      this.selected = [];
      if (selected) {
        for (let i = 0; i < selected.length; i++) {
          if (selected[i].hasOwnProperty('id')) {
            // Must be a reference
            this.selected.push(this.treeConfig.getProxyFor(selected[i].id))
          } else {
            // Must be an id field insteaad of a reference
            this.selected.push(this.treeConfig.getProxyFor(selected[i]))
          }
        }
      }
    } else if (selected) {
      if (selected.hasOwnProperty('id')) {
        // Must be a reference
        // TODO - Update to handle non-editable historical records
        this.selected = this.treeConfig.getProxyFor(selected.id);
      } else {
        // TODO - Update to handle non-editable historical records
        // Must be an id field insteaad of a reference
        this.selected= this.treeConfig.getProxyFor(selected);
      }
    }
  }

  onProxySelected(selectedEvent: MatAutocompleteSelectedEvent) {
    this.selected = this.treeConfig.getProxyFor(selectedEvent.option.value);
  }


  getSelectedProxies(): Array<ItemProxy> {
    return this.selected;
  }

  openProxySelectionDialog(): void {
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {
        allowMultiSelect: this.allowMultiSelect,
        selected: this.selected
      }
    }).updateSize('60%', '60%').afterClosed().subscribe((selected : any) => {
      if (this.allowMultiSelect) {
        let selectedIds = [];
        if (selected) {
          this.selected = selected;
          for (let i = 0; i < this.selected.length; i++) {
            selectedIds.push({ id: this.selected[i].item.id });
          }
        }
        this.formGroup.controls[this.fieldId].setValue(selectedIds);
        this.formGroup.controls[this.fieldId].markAsDirty();
      } else {
        this.selected = selected;
        if (this.selected) {
          this.formGroup.controls[this.fieldId].setValue({ id: this.selected.item.id });
        } else {
          this.formGroup.controls[this.fieldId].setValue(undefined);
        }
        this.formGroup.controls[this.fieldId].markAsDirty();
      }
    })
  }
}
