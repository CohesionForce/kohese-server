import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserInput } from '../user-input.class';
import { ItemProxy } from '../../../../../common/models/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { TreeComponent } from '../../tree/tree.component';
import { Observable } from 'rxjs/Observable';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'k-proxy-selector',
  templateUrl: './k-proxy-selector.component.html'
})
export class KProxySelectorComponent extends UserInput
  implements OnInit {
  @Input()
  public formGroup: FormGroup;
  @Input()
  public type: string;
  @Input()
  public allowMultiSelect: boolean;
  @Input()
  public useAdvancedSelector: boolean;
  public selectedProxies: Array<ItemProxy> = [];
  private typeProxies: Array<ItemProxy> = [];
  public filteredProxies: Observable<Array<ItemProxy>>;
  public selectedUser : ItemProxy;

  constructor(private ItemRepository: ItemRepository,
    private dialogService: DialogService) {
    super();
  }
  
  ngOnInit(): void {
    this.ItemRepository.getRootProxy().visitTree(undefined, (proxy) => {
      if ((this.type === proxy.kind) && proxy.item) {
        this.typeProxies.push(proxy);
      }
    }, undefined);
    this.filteredProxies = this.formGroup.get(this.fieldId).valueChanges.startWith('').
      map((text: string) => {
      return this.typeProxies.filter((proxy) => {
        return (-1 !== proxy.item.name.indexOf(text));
      });
    });
  }

  onUserSelected (selectedEvent : MatAutocompleteSelectedEvent) {
    this.selectedUser = this.ItemRepository.getProxyFor(selectedEvent.option.value);
    console.log(this.selectedUser);
} 

  
  getSelectedProxies(): Array<ItemProxy> {
    return this.selectedProxies;
  }
  
  openProxySelectionDialog(): void {
    // TODO
    /*this.dialogService.openComponentDialog(TreeComponent, {
      allowMultiSelect: this.allowMultiSelect
    }).afterClosed((proxies) => {
      this.selectedProxies = proxies;
    });*/
  }
}