import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserInput } from '../user-input.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { TreeComponent } from '../../tree/tree.component';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/startWith';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'k-proxy-selector',
  templateUrl: './k-proxy-selector.component.html',
  styleUrls: ['./k-proxy-selector.component.scss']
})
export class KProxySelectorComponent extends UserInput
  implements OnInit, OnDestroy {
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
  public filteredProxies: Array<ItemProxy>;
  public selectedProxy : ItemProxy;
  private _proxyFilterSubscription: Subscription;

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
    this._proxyFilterSubscription = this.formGroup.get(this.fieldId).
      valueChanges.startWith('').subscribe((text: string) => {
      this.filteredProxies = this.typeProxies.filter((proxy: ItemProxy) => {
        return (-1 !== proxy.item.name.indexOf(text));
      });
    });
  }
  
  public ngOnDestroy(): void {
    this._proxyFilterSubscription.unsubscribe();
  }

  onProxySelected (selectedEvent : MatAutocompleteSelectedEvent) {
    this.selectedProxy = this.ItemRepository.getProxyFor(selectedEvent.option.value);
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