import { Component, Input, OnInit } from "@angular/core";
import { ReferenceTableInfo } from "../references-tab.component";
import { NavigationService } from "../../../../services/navigation/navigation.service";
import { NavigatableComponent } from "../../../../classes/NavigationComponent.class";
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';
import { ItemProxy } from '../../../../../../common/src/item-proxy';


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
  rowDef: Array<string> = ["kind", "name", "state", "description", "Nav"];
  get navigationService() {
    return this._navigationService;
  }

  constructor(private _navigationService: NavigationService, private _dialogService: DialogService) {}

  ngOnInit() {
    console.log(this);
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }

}
