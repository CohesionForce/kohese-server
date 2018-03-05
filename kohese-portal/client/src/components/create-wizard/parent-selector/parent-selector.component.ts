import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import * as ItemProxy from '../../../../../common/models/item-proxy';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'parent-selector',
  templateUrl: './parent-selector.component.html'
})
export class ParentSelectorComponent implements OnInit {
  
  /* Data */
  rootProxy : ItemProxy;
  selectedParent : ItemProxy;
  @Output()
  parentSelected : EventEmitter<ItemProxy> = new EventEmitter();
  repoInitialized : boolean = false;
  proxySearchControl : FormControl;
  filteredProxies : any;
  recentProxies : Array<ItemProxy>;

  constructor(private itemRepository: ItemRepository){
    this.proxySearchControl = new FormControl('');
  }

  ngOnInit () {
    console.log('ps init')
    this.itemRepository.getRepoStatusSubject().subscribe((update)=>{
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        this.rootProxy = this.itemRepository.getRootProxy();
        this.filteredProxies = this.proxySearchControl.valueChanges.startWith('').
          map((text: string) => {
            return this.rootProxy.children.filter((proxy) => {
              return (-1 !== proxy.item.name.indexOf(text));
            });
          });
        this.recentProxies = this.itemRepository.getRecentProxies();
        this.recentProxies = this.recentProxies.slice().reverse();      
        this.repoInitialized = true;
      }
    })
  }

  selectParent (selection : ItemProxy) {
    this.selectedParent = selection;
    this.parentSelected.emit(selection)
  }

  onAutoCompleteSelected(selectedProxyEvent : MatAutocompleteSelectedEvent) {
    this.selectedParent = selectedProxyEvent.option.value;
    this.parentSelected.next(selectedProxyEvent.option.value);
    this.proxySearchControl.setValue(selectedProxyEvent.option.value.item.name);
  }

}
