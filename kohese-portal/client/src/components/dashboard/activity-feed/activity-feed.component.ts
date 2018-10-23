import { DetailsDialogComponent } from './../../details/details-dialog/details-dialog.component';
import { DialogService } from './../../../services/dialog/dialog.service';
import { Component, OnInit, Input } from '@angular/core';
import { ItemProxy } from '../../../../../common/src/item-proxy';

@Component({
  selector: 'activity-feed',
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss']
})
export class ActivityFeedComponent implements OnInit {
  @Input()
  activityList : Array<ItemProxy>;

  constructor(private dialogService : DialogService) { }

  ngOnInit() {
    console.log(this);
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }

}
