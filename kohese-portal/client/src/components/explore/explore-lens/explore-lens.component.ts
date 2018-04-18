import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { LensService, ApplicationLens } from "../../../services/lens-service/lens.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'explore-lens',
  templateUrl : './explore-lens.component.html',
  styleUrls : ['./explore-lens.component.scss']
})
export class ExploreLensComponent implements OnInit, OnDestroy {

  currentLens : ApplicationLens;
  lensSubscription : Subscription;

  /* Const data */
  LENSES : any;

  constructor (private lensService : LensService) {
    this.LENSES = ApplicationLens;
  }

  ngOnInit () {
    this.lensSubscription = this.lensService.getLensSubject().subscribe((newLens)=>{
      this.currentLens = newLens;
    })
  }

  ngOnDestroy () {
    this.lensSubscription.unsubscribe();
  }
}