import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserInput } from '../user-input.class';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';

import { ItemProxy } from '../../../../../common/models/item-proxy';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'k-user-selector',
  templateUrl: './k-user-selector.component.html'
})
export class KUserSelectorComponent extends UserInput implements OnInit, OnDestroy {
  userProxies : Array<ItemProxy>;
  filteredProxies : Observable<Array<ItemProxy>>;
  repoStagingSub : Subscription
  selectedUser : ItemProxy;

  constructor(private ItemRepository : ItemRepository,
              private SessionService : SessionService) {
    super();
  }

  ngOnInit () { 
    this.repoStagingSub = this.ItemRepository.getRepoStatusSubject().subscribe((update)=>{
        if (update.connected) { 
            this.userProxies = this.SessionService.getUsers()
            this.filteredProxies = this.formGroup.get(this.fieldId).valueChanges.startWith('').
                map((text: string) => {
                    return this.userProxies.filter((proxy) => {
                        return (-1 !== proxy.item.name.indexOf(text));
                    });
                })
        }})
  }


  ngOnDestroy () {
      this.repoStagingSub.unsubscribe();
  }
}

