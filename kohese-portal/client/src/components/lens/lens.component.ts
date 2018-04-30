import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { LensService, ApplicationLens } from "../../services/lens-service/lens.service";
import { Subscription } from 'rxjs';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { ItemRepository, RepoStates } from "../../services/item-repository/item-repository.service";

@Component({
  selector: 'lens',
  templateUrl : './lens.component.html',
  styleUrls : ['./lens.component.scss']
})
export class LensComponent implements OnInit, OnDestroy {

  currentLens : ApplicationLens;
  lensSubscription : Subscription;
  repoStatusSubscription : Subscription;
  commitList : Array<any>;
  selectedCommit : any;

  /* Const data */
  LENSES : any;

  constructor (private lensService : LensService,
               private itemRepository : ItemRepository) {
    this.LENSES = ApplicationLens;
  }

  ngOnInit () {
    this.lensSubscription = this.lensService.getLensSubject().subscribe((newLens)=>{
      this.currentLens = newLens;
    })
    this.repoStatusSubscription = this.itemRepository.getRepoStatusSubject()
      .subscribe((update)=>{
        if (RepoStates.SYNCHRONIZATION_SUCCEEDED === update.state) {
          this.commitList = TreeConfiguration.getItemCache().getCommits();
        }
    })


  }

  ngOnDestroy () {
    this.lensSubscription.unsubscribe();
    this.repoStatusSubscription.unsubscribe();
  }
}
