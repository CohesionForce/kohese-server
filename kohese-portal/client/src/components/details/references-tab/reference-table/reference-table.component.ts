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


import { Component, Input, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { ReferenceTableInfo } from "../references-tab.component";
import { NavigationService } from "../../../../services/navigation/navigation.service";
import { NavigatableComponent } from "../../../../classes/NavigationComponent.class";
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { MatMenuTrigger } from "@angular/material";

@Component({
  selector: "reference-table",
  templateUrl: "./reference-table.component.html",
  styleUrls: ["../references-tab.component.scss", "./reference-table.component.scss"]
})
export class ReferenceTableComponent implements OnInit {
  /* Data */
  @Input()
  referencesInfo: Array<ReferenceTableInfo>;
  @Input()
  routingStrategy: string;
  rowDef: Array<string> = ["kind", "name", "state", "nav"];

  get navigationService() {
    return this._navigationService;
  }

  constructor(private _navigationService: NavigationService, private _dialogService: DialogService) { }

  ngOnInit() {
    console.log(this);
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }
}
