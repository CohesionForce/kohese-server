import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { BehaviorSubject } from 'rxjs';
import { ProxyDetailsComponent } from '../ProxyDetails.Class';

@Component({
  selector: 'details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.scss']
})
export class DetailsDialogComponent extends ProxyDetailsComponent implements OnInit, OnDestroy {
  itemProxy: ItemProxy;
  proxyStream: BehaviorSubject<ItemProxy>;
  editableStream : BehaviorSubject<boolean>
  hideDocument : boolean;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    protected navigationService: NavigationService,
    protected itemRepository: ItemRepository,
    private matDialogRef: MatDialogRef<DetailsDialogComponent>) {

    super(navigationService, itemRepository);
    this.itemProxy = data.itemProxy
    this.proxyStream = new BehaviorSubject<ItemProxy>(this.itemProxy);
    this.hideDocument = data.hideDocument
  }

  ngOnInit() {
    console.log(this);
  }

  ngOnDestroy() {

  }

  close() {
    this.matDialogRef.close();
  }


  updateProxy() {

  }
}
