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
import { Component, OnInit, Input } from '@angular/core';

// Other External Dependencies

// Kohese
import { DetailsComponent } from './../../details/details.component';
import { DialogService } from './../../../services/dialog/dialog.service';
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
    this.activityList.sort((a, b) => {
      if (a.item.modifiedOn > b.item.modifiedOn) {
        return -1
      } else if (a.item.modifiedOn <= b.item.modifiedOn) {
        return 1;
      }
    })
  }

  openProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsComponent, {
      data : {
        itemProxy : proxy
      }
    }).updateSize('80%', '80%')
      .afterClosed().subscribe((results)=>{

      });
  }

}
