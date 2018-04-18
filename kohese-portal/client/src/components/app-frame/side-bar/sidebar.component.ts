import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component'; 
import { ImportComponent } from '../../create-wizard/import/import.component';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ApplicationLens, LensService } from '../../../services/lens-service/lens.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'side-bar',
  templateUrl: './sidebar.component.html',
  styleUrls : ['./sidebar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {
  authenticated : boolean = false;
  LENSES : any;
  currentLens : any;

  currentUserSubscription : Subscription;
  lensSubscription : Subscription;
  
  constructor(private dialogService: DialogService,
    private itemRepository: ItemRepository,
    private currentUserService: CurrentUserService,
    private lensService : LensService) {
      this.LENSES = ApplicationLens
  }

  ngOnInit() {
    this.currentUserSubscription = this.currentUserService.getCurrentUserSubject().subscribe((userInfo)=>{
      console.log(userInfo);
      if(userInfo) {
        this.authenticated = true;
      }
    })
    this.lensSubscription = this.lensService.getLensSubject().subscribe((newLens)=>{
      this.currentLens = newLens;
    })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  changeLens(lens : ApplicationLens) {
    this.lensService.setLens(lens);
  }
  
  openNewDialog(): void {
    this.dialogService.openComponentDialog(CreateWizardComponent, {}).
      updateSize('70%', '70%');
  }
  
  openImportDialog(): void {
    this.dialogService.openComponentDialog(ImportComponent, {}).
      updateSize('70%', 'auto');
  }
}
