
import { map, startWith} from 'rxjs/operators';
import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Subscription } from 'rxjs';

interface RelationInfo {
  proxy: ItemProxy;
  relationKind: string;
}
@Component({
  selector: 'proxy-selector',
  templateUrl: './proxy-selector.component.html',
  styleUrls: ['./proxy-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProxySelectorComponent implements OnInit {

  /* Data */
  @Input()
  multiSelect: boolean;
  @Input()
  selection: any;
  @Input()
  proxyContext: ItemProxy;
  @Output()
  proxySelected: EventEmitter<any> = new EventEmitter();

  rootProxy: ItemProxy;
  selected: any;
  selectedMap: Map<string, ItemProxy> = new Map();
  repoInitialized = false;
  proxySearchControl: FormControl;
  proxySearchInitialized: boolean;
  treeInitialized: boolean;
  filteredProxies: any;
  recentProxies: Array<ItemProxy>;
  relatedProxies: Array<RelationInfo>;

  treeConfig: any;
  treeConfigSub: Subscription;

  constructor(private itemRepository: ItemRepository) {
    this.proxySearchControl = new FormControl('');
  }

  ngOnInit() {
    this.treeConfigSub =
      this.itemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {
          this.treeConfig = newConfig.config;
          this.rootProxy = this.treeConfig.getRootProxy();
          this.recentProxies = this.itemRepository.getRecentProxies();
          this.recentProxies = this.recentProxies.slice().reverse();
          if (this.proxyContext) {
            this.generateRelatedProxies();
          }
          this.repoInitialized = true;
        }
        if (this.selection) {
          if (this.multiSelect) {
            this.selected = this.selection;
            for (let i = 0; i < this.selected.length; i++) {
              const proxy = this.selected[i];
              this.selectedMap.set(proxy.item.id, proxy);
            }
          } else {
            this.selected = this.selection;
          }
        }
      });
  }

  initProxySearch() {
    if (!this.proxySearchInitialized) {
      this.filteredProxies = this.proxySearchControl.valueChanges.pipe(startWith(''),
        map((text: string) => {
          return this.rootProxy.getDescendants().filter((proxy) => {
            return (-1 !== proxy.item.name.indexOf(text));
          });
      }));
    }
    this.proxySearchInitialized = true;
  }

  selectProxy(selection: ItemProxy) {
    console.log(selection);
    if (this.multiSelect) {
      let matchesSelection = false;
      for (let i = 0; i < this.selected.length; i++) {
        const proxy = this.selected[i];
        if (proxy === selection) {
          matchesSelection = true;
          break;
        }
      }
      if (!matchesSelection) {
        this.selected.push(selection);
        this.selectedMap.set(selection.item.id, selection);
        this.proxySelected.emit(this.selected);
      }

    } else {
      this.selected = selection;
      this.proxySelected.emit(this.selected);
    }
  }

  onAutoCompleteSelected(selectedProxyEvent: MatAutocompleteSelectedEvent) {
    this.selected = selectedProxyEvent.option.value;
    this.proxySelected.next(selectedProxyEvent.option.value);
    this.proxySearchControl.setValue(selectedProxyEvent.option.value.item.name);
  }

  onTabSelected(tabEvent) {
    switch (tabEvent.index) {
      case 1:
        this.treeInitialized = true;
        break;
      case 2:
        this.initProxySearch();
    }
  }

  removeSelection(selection: ItemProxy) {
    if (this.multiSelect) {
      for (let i = 0; i < this.selected.length; i++) {
        const proxy = this.selected[i];
        if (proxy === selection) {
          this.selected.splice(i, 1);
          this.selectedMap.delete(selection.item.id);
        }
      }
    }
  }

  generateRelatedProxies() {
    this.relatedProxies = [];
    console.log(this.proxyContext);
    let siblingProxies: Array<ItemProxy>;
    if (this.proxyContext.parentProxy) {
      siblingProxies = this.proxyContext.parentProxy.children;
    } else {
      siblingProxies = TreeConfiguration.getWorkingTree().getProxyFor(this.
        proxyContext.item.parentId).children;
    }
    for (const proxy in siblingProxies) {
      if (siblingProxies[proxy]) {
        if (siblingProxies[proxy].item.id === this.proxyContext.item.id) {
          continue;
        }
        this.relatedProxies.push(
          { proxy : siblingProxies[proxy],
            relationKind : 'Sibling'
          });
      }
    }
  }
}
