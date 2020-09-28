import { Component, Input, OnInit, ViewChild, ViewChildren, QueryList } from "@angular/core";
import { ReferenceTableInfo } from "../references-tab.component";
import { NavigationService } from "../../../../services/navigation/navigation.service";
import { NavigatableComponent } from "../../../../classes/NavigationComponent.class";
import { DialogService } from '../../../../services/dialog/dialog.service';
import { DetailsComponent } from '../../../details/details.component';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { MatMenuTrigger } from "@angular/material";
import { MenuItem } from "../../../context-menu/context-menu.component";

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

  constructor(private _navigationService: NavigationService, private _dialogService: DialogService) { }

  ngOnInit() {
    console.log(this);
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }

  @ViewChildren(MatMenuTrigger)
  contextMenu: QueryList<MatMenuTrigger>;

  contextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, contextMenuComponent: HTMLDivElement, itemProxy: ItemProxy) {
    event.preventDefault();
    contextMenuComponent.style.left = event.clientX + 'px';
    contextMenuComponent.style.top = event.clientY + 'px';
    this.contextMenu.toArray()[0].menuData= { itemProxy: itemProxy };
    this.contextMenu.toArray()[0].menu.focusFirstItem('mouse');
    this.contextMenu.toArray()[0].openMenu();
  }

  public getMenuItems(itemProxy: ItemProxy): MenuItem[] {
    return [{
      action: 'Display Item',
      icon: 'fa fa-clone',
      execute: () => {
        this._dialogService.openComponentDialog(DetailsComponent, {
          data: { itemProxy: itemProxy }
        }).updateSize('90%', '90%');
      }
    }, {
      action: 'Navigate in Explorer',
      icon: 'fa fa-arrow-right',
      execute: () => {
        console.log('Executed: Navigate in Explorer');
        this._navigationService.navigate('Explore', { id: itemProxy.item.id });
      },
    }, {
      action: 'Open in New Tab',
      icon: 'fa fa-external-link',
      execute: () => {
        this._navigationService.addTab('Explore', { id: itemProxy.item.id });
      }
    }]
  }
}
