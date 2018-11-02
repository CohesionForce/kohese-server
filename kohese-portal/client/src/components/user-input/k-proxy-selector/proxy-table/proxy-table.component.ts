import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-proxy-table',
  templateUrl: './proxy-table.component.html',
  styleUrls: ['./proxy-table.component.scss'],
  animations : [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProxyTableComponent {

    dataSource = [];
    columnsToDisplay = ['name', 'kind', 'createdOn'];
    expandedItem: ItemProxy;

    toggleExpand(item) {
      if (this.expandedItem !== item) {
        this.expandedItem = item;
      } else {
        this.expandedItem = undefined;
      }
    }
}
