
import {map, startWith} from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserInput } from '../user-input.class';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Subscription ,  Observable } from 'rxjs';

@Component({
  selector: 'k-user-selector',
  templateUrl: './k-user-selector.component.html',
  styleUrls: ['./k-user-selector.component.scss']
})
export class KUserSelectorComponent extends UserInput implements OnInit, OnDestroy {
  userProxies : Array<ItemProxy>;
  filteredProxiesSub : Subscription;
  filteredProxies : Array<ItemProxy>;
  repoStagingSub : Subscription;

  constructor(private ItemRepository : ItemRepository,
              private SessionService : SessionService) {
    super();
  }

  ngOnInit () { 
    this.repoStagingSub = this.ItemRepository.getRepoStatusSubject().subscribe((update)=>{
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) { 
        this.filteredProxiesSub = this.formGroup.get(this.fieldId).
          valueChanges.pipe(startWith(''), map((text: string) => {
          return this.SessionService.users.filter((user: any) => {
            return (-1 !== user.name.indexOf(text));
          });
        }),).subscribe((filteredProxies)=> {
          this.filteredProxies = filteredProxies;
        });
      }
    });
  }


  ngOnDestroy () {
      this.repoStagingSub.unsubscribe();
      this.filteredProxiesSub.unsubscribe();
    }
}

