import { Component, OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NewComponent } from '../new/new.component';
import { ImportComponent } from '../import/import.component';

@Component({
  selector: 'side-bar',
  templateUrl: './sidebar.component.html'
})
export class SideBarComponent implements OnInit {
  constructor(private dialogService: DialogService,
    private itemRepository: ItemRepository,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
  }
  
  openNewDialog(): void {
    this.dialogService.openComponentDialog(NewComponent, {}).
      updateSize('70%', 'auto');
  }
  
  openImportDialog(): void {
    this.dialogService.openComponentDialog(ImportComponent, {}).
      updateSize('40%', 'auto');
  }
}
