import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import * as ItemProxy from '../../../../../common/models/item-proxy';

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
  
  constructor(private itemRepository: ItemRepository){

  }

  ngOnInit () {
    console.log('ps init')
    this.itemRepository.getRepoStatusSubject().subscribe((update)=>{
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
        this.rootProxy = this.itemRepository.getRootProxy();
        this.repoInitialized = true;
        console.log(this);
      }
    })
  }

  selectParent (selection : ItemProxy) {
    this.parentSelected.emit(selection)
  }
}
