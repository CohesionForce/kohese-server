/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component';
import { ImportComponent } from '../../import/import.component';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ApplicationLens, LensService } from '../../../services/lens-service/lens.service';

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
    this.currentUserSubscription = this.currentUserService.
      getCurrentUserSubject().subscribe((userInfo: any)=>{
      this.authenticated = !!userInfo;
    });
    this.lensSubscription = this.lensService.getLensSubject().subscribe((newLens)=>{
      this.currentLens = newLens;
    })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.lensSubscription.unsubscribe();
  }

  changeLens(lens : ApplicationLens) {
    this.lensService.setLens(lens);
  }

  openNewDialog(): void {
    this.dialogService.openComponentDialog(CreateWizardComponent, {}).
      updateSize('70%', '70%');
  }

  openImportDialog(): void {
    this.dialogService.openComponentDialog(ImportComponent, {
      data: {}
    }).updateSize('90%', '90%');
  }

}
