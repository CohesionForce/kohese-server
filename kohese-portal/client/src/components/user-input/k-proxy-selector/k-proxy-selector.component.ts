import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserInput } from '../user-input.class';
import * as ItemProxy  from '../../../../../common/src/item-proxy';
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
  public selectedProxy : ItemProxy;

  constructor(private ItemRepository: ItemRepository,
    private dialogService: DialogService) {
    super();
  }
  
  ngOnInit(): void {
      let selected = this.formGroup.controls[this.fieldId].value;
      if (selected instanceof Array) {
        for (let i = 0; i < selected.length; i++) {
          this.selectedProxies.push(ItemProxy.getProxyFor(selected[i].id))
        } 
      } else if (selected) {
          this.selectedProxy = ItemProxy.getProxyFor(selected.id);
      }
  }
  
  public ngOnDestroy(): void {

  }

  onProxySelected (selectedEvent : MatAutocompleteSelectedEvent) {
    this.selectedProxy = this.ItemRepository.getProxyFor(selectedEvent.option.value);
} 

  
  getSelectedProxies(): Array<ItemProxy> {
    return this.selectedProxies;
  }
  
  openProxySelectionDialog(): void {
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data : {
        allowMultiSelect: this.allowMultiSelect,
        selected : (this.selectedProxy) ? this.selectedProxy : this.selectedProxies 
      }
    }).updateSize('60%', '60%').afterClosed().subscribe((selected)=>{
      if (selected instanceof Array) {
        let selectedIds = [];
        for (let i = 0; i < selected.length; i++) {
          selectedIds.push({ id : selected[i].item.id});
        }
        this.selectedProxies = selected;
        this.formGroup.controls[this.fieldId].setValue(selectedIds);
      } else if (selected) {
        this.selectedProxy = selected;
        this.formGroup.controls[this.fieldId].setValue({id: selected.item.id}); 
        console.log(this.formGroup);
      }
    })
  }
}