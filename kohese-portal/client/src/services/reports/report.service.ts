import { BehaviorSubject ,  Subscription } from 'rxjs';
import { ItemRepository } from './../item-repository/item-repository.service';
import { Injectable } from '@angular/core';
import { ItemProxy } from '../../../../common/src/item-proxy';


@Injectable()
export class ReportService {
  treeConfigSubscription : Subscription;
  reportDefinitions : Array<ItemProxy>;
  reportDefSubject : BehaviorSubject<Array<ItemProxy>> = new BehaviorSubject<Array<ItemProxy>>([]);

  constructor(private itemRepository : ItemRepository) {
    this.initReports()
  }

  initReports(){
    this.treeConfigSubscription =
      this.itemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {
          // Generate Project Info
          this.reportDefinitions = newConfig.config.getAllItemProxies()
            .filter((proxy) => {
              if (proxy.kind === 'ReportDefinition') {
                return true;
              }
            })
          this.reportDefSubject.next(this.reportDefinitions);

          console.log(this.reportDefinitions);
        }
      })
    }

    generateReportDefinitions() : Array<ItemProxy> {
      let reportDefs = [];
      return reportDefs;
    }

    getReportSubscription() : BehaviorSubject<Array<ItemProxy>> {
      return this.reportDefSubject;
    }
}
