import {
  DialogService
} from './../../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import {
  DetailsComponent
} from '../../../details/details.component';
import {
  ItemProxy
} from './../../../../../../common/src/item-proxy';
import {
  PropertyDefinition
} from './../../../type-editor/PropertyDefinition.interface';
import { TreeComponent } from '../../../tree/tree.component';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';
import {
  Component,
  OnInit,
  Input
} from '@angular/core';

@Component({
  selector: 'kd-proxy-selector',
  templateUrl: './kd-proxy-selector.component.html',
  styleUrls: ['./kd-proxy-selector.component.scss']
})
export class KdProxySelectorComponent implements OnInit {
  @Input()
  property: PropertyDefinition;
  @Input()
  editable: boolean;
  @Input()
  proxy: ItemProxy
  @Input()
  references: Array < ItemProxy > = [];
  @Input()
  multiselect : boolean;

  public constructor(private dialogService: DialogService,
    private _itemRepository: ItemRepository) {

  }

  ngOnInit() {
    let selected = this.proxy.item[this.property.propertyName];
    if (selected) {
      if (this.multiselect) {
        for (let proxyIdStruct of this.proxy.item[this.property.
          propertyName]) {
          this.references.push(ItemProxy.getWorkingTree().getProxyFor(proxyIdStruct.id));
        }
      } else {
        this.references.push(ItemProxy.getWorkingTree().getProxyFor(selected))
      }
    } else {
      this.references = [];
    }
  }


  openDetails(proxy) {
    this.dialogService.openComponentDialog(DetailsComponent, {
        data: {
          itemProxy: proxy
        }
      }).updateSize('80%', '80%')
      .afterClosed().subscribe((results) => {

      });
  }

  openProxySelectionDialog(): void {
    let ids = this.proxy.item[this.property.propertyName];
    let selected;
    if (this.multiselect) {
      if (ids) {
        selected = ids.forEach((idStruct) => {
          return ItemProxy.getWorkingTree().getProxyFor(idStruct.id);
        })
      } else {
        selected = [];
      }
    } else {
      if (ids) {
        selected = ItemProxy.getWorkingTree().getProxyFor(ids);
      }
    }
    console.log(this.property);
    this.dialogService.openComponentDialog(TreeComponent, {
      data: {
        root: TreeConfiguration.getWorkingTree().getRootProxy(),
        getChildren: (element: any) => {
          return (element as ItemProxy).children;
        },
        getText: (element: any) => {
          return (element as ItemProxy).item.name;
        },
        getIcon: (element: any) => {
          return this._itemRepository.getTreeConfig().getValue().config.
            getProxyFor('view-' + (element as ItemProxy).kind.toLowerCase()).
            item.icon;
        },
        selection: (Array.isArray(selected) ? selected : [selected]),
        quickSelectElements: this._itemRepository.getRecentProxies(),
        allowMultiselect: this.multiselect,
        showSelections: this.multiselect
      }
    }).updateSize('90%', '90%').afterClosed().subscribe((selection:
      Array<any>) => {
      if (selection) {
        if (this.multiselect) {
          let proxyIds = [];
           selection.forEach((proxy)=>{
            this.references.push(proxy)
            proxyIds.push({id: proxy.item.id})
          })
          this.proxy.item[this.property.propertyName] = proxyIds;
        } else {
          this.proxy.item[this.property.propertyName] =
            { id: selection[0].item.id };
          this.references.push(selection[0]);
        }
      } else if (!this.multiselect) {
        this.proxy.item[this.property.propertyName] = undefined;
      }
    });
  }
}
