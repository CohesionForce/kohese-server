import { Component, Input, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserInput } from '../user-input.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { TreeComponent } from '../../tree/tree.component';
import { Observable ,  Subscription } from 'rxjs';

import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'k-proxy-selector',
  templateUrl: './k-proxy-selector.component.html',
  styleUrls: ['./k-proxy-selector.component.scss']
})
export class KProxySelectorComponent extends UserInput
  implements OnInit, OnDestroy, OnChanges {
  @Input()
  public type: string;
  @Input()
  public allowMultiSelect: boolean;
  public selected: any;
  @Input()
  proxyContext: ItemProxy;
  @Input()
  editableStream: Observable<boolean>;
  editableStreamSub: Subscription;
  editable: boolean;
  initialized = false;

  treeConfigSub: Subscription;
  treeConfig: any;

  constructor(private itemRepository: ItemRepository,
    private dialogService: DialogService) {
    super();
  }

  ngOnInit(): void {
    this.editableStreamSub = this.editableStream.subscribe((editable) => {
      this.editable = editable;
    });

    this.treeConfigSub = this.itemRepository.getTreeConfig().subscribe((newConfig) => {
      if (newConfig) {
        this.treeConfig = newConfig.config;
        this.initSelections();
      }
    });

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
    const selected = this.formGroup.controls[this.fieldId].value;
    if (this.allowMultiSelect) {
      this.selected = [];
      if (selected) {
        for (let i = 0; i < selected.length; i++) {
          if (selected[i].hasOwnProperty('id')) {
            // Must be a reference
            this.selected.push(this.treeConfig.getProxyFor(selected[i].id));
          } else {
            // Must be an id field insteaad of a reference
            this.selected.push(this.treeConfig.getProxyFor(selected[i]));
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
        this.selected = this.treeConfig.getProxyFor(selected);
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
    this.dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        getIcon: (element: any) => {
          return (element as ItemProxy).model.view.item.icon;
        },
        selection: (Array.isArray(this.selected) ? this.selected : [this.
          selected]),
        quickSelectElements: this.itemRepository.getRecentProxies(),
        allowMultiselect: this.allowMultiSelect,
        showSelections: this.allowMultiSelect
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        if (this.allowMultiSelect) {
          const selectedIds = [];
          this.selected = selection;
          for (let i = 0; i < this.selected.length; i++) {
            selectedIds.push({ id: this.selected[i].item.id });
          }
          this.formGroup.controls[this.fieldId].setValue(selectedIds);
          this.formGroup.controls[this.fieldId].markAsDirty();
        } else {
          this.selected = selection[0];
          this.formGroup.controls[this.fieldId].setValue({ id: this.selected.item.id });
          this.formGroup.controls[this.fieldId].markAsDirty();
        }
      } else if (!this.allowMultiSelect) {
        this.formGroup.controls[this.fieldId].setValue(undefined);
      }
    });
  }
}
