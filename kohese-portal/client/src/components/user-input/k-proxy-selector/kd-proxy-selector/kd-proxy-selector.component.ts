import { ProxySelectorDialogComponent } from './../proxy-selector-dialog/proxy-selector-dialog.component';
import {
  DialogService
} from './../../../../services/dialog/dialog.service';
import {
  DetailsDialogComponent
} from './../../../details/details-dialog/details-dialog.component';
import {
  ItemProxy
} from './../../../../../../common/src/item-proxy';
import {
  PropertyDefinition
} from './../../../type-editor/format-editor/format-editor.component';
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

  constructor(private dialogService: DialogService) {

  }

  ngOnInit() {
    if (!this.proxy) {
      console.log('log');
    }
    if (this.proxy.item[this.property.propertyName]) {
      if (Array.isArray(this.proxy.item[this.property.propertyName])) {
        for (let proxyIdStruct of this.proxy.item[this.property.propertyName]) {
          this.references.push(ItemProxy.getWorkingTree().getProxyFor(proxyIdStruct.id));
        }
    } else {
      this.references.push(ItemProxy.getWorkingTree().getProxyFor(this.proxy.item[this.property.propertyName]))
    }
    }
  }

  openDetails(proxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
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
      selected = this.proxy.item[this.property.propertyName].forEach((idStruct) => {
        return ItemProxy.getWorkingTree().getProxyFor(idStruct.id);
      })
    } else {
      if (ids) {
        selected = ItemProxy.getWorkingTree().getProxyFor(ids);
      }
    }
    console.log(this.property);
    this.dialogService.openComponentDialog(ProxySelectorDialogComponent, {

      data: {
        allowMultiSelect: true, // TODO : check how this can be tested
        selected: selected
      }
    }).updateSize('80%', '80%').afterClosed().subscribe((selected : any) => {
      if (this.multiselect) {
        let proxyIds = [];
        this.references = [];
        if (selected) {
           selected.forEach((proxy)=>{
            this.references.push(proxy)
            proxyIds.push({id: proxy.item.id})
          })
        }
        this.proxy.item[this.property.propertyName] = proxyIds;
      } else {
        if (selected) {
          this.proxy.item[this.property.propertyName] = { id: selected.item.id };
        } else {
          this.proxy.item[this.property.propertyName] = undefined;
        }
        console.log('proxy saved');
      }
    })
  }
}
