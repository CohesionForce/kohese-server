import { Component, OnInit } from '@angular/core';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { CreateWizardComponent } from '../../create-wizard/create-wizard.component'; 
import { ImportComponent } from '../../create-wizard/import/import.component';
import { CurrentUserService } from '../../../services/user/current-user.service';

@Component({
  selector: 'side-bar',
  templateUrl: './sidebar.component.html'
})
export class SideBarComponent implements OnInit {
  authenticated : boolean = false;
  
  constructor(private dialogService: DialogService,
    private itemRepository: ItemRepository,
    private CurrentUserService: CurrentUserService) {
  }

  ngOnInit() {
    this.CurrentUserService.getCurrentUserSubject().subscribe((userInfo)=>{
      console.log(userInfo);
      if(userInfo) {
        this.authenticated = true;
      }
    })
  }
  
  openNewDialog(): void {
    this.dialogService.openComponentDialog(CreateWizardComponent, {}).
      updateSize('70%', 'auto');
  }
  
  openImportDialog(): void {
    this.dialogService.openComponentDialog(ImportComponent, {}).
      updateSize('70%', 'auto');
  }
}
