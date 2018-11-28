import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { ItemRepository } from './../../../../services/item-repository/item-repository.service';
import { ItemProxy } from './../../../../../../common/src/item-proxy';
import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TreeConfiguration } from './../../../../../../common/src/tree-configuration';

@Component({
  selector: 'proxy-table',
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
export class ProxyTableComponent implements OnInit {
    @Input()
    columns: Array<string>;
    @Input()
    dataStream: Observable<any>;
    @Input()
    expandable: boolean;
    expandedEdit = false;

    dataSource: Array<ItemProxy>;

    expandedItem: ItemProxy;
    treeConfigSub: Subscription;
    treeConfig: TreeConfiguration;

    constructor(private itemRepository: ItemRepository,
                private changeRef: ChangeDetectorRef) {

    }

    ngOnInit() {
      this.treeConfigSub = this.itemRepository.getTreeConfig()
        .subscribe((newConfig) => {
        if (newConfig) {
          this.treeConfig = newConfig.config;
          this.dataStream.subscribe((data) => {
            this.dataSource = [];
            for (const idx in data) {
              if (idx) {
                const proxy = newConfig.config.getProxyFor(data[idx].id);
                if (proxy) {
                  this.dataSource.push(proxy);
                }
              }
            }
            this.changeRef.markForCheck();
            console.log(this);
          });
        }
    });
  }

    toggleExpand(item) {
      console.log(item);
      if (this.expandedItem !== item) {
        this.expandedItem = item;
      } else {
        this.expandedItem = undefined;
      }
    }

    ////////////

    stateChanged(a, b, c) {
      console.log(a, b, c);
    }
    ////
    upsertItem(proxy: ItemProxy) {
      this.itemRepository.upsertItem(proxy).then((savedProxy) => {
        if (savedProxy) {
          this.expandedEdit = false;
        }
      });
    }
}
