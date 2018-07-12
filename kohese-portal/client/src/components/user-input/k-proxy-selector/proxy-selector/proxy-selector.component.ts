import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ItemRepository, RepoStates } from '../../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'proxy-selector',
  templateUrl: './proxy-selector.component.html',
  styleUrls: ['./proxy-selector.component.scss']
})
export class ProxySelectorComponent implements OnInit {

  /* Data */
  @Input()
  multiSelect: boolean;
  @Input()
  selection: any;

  rootProxy: ItemProxy;
  selectedProxy: ItemProxy;
  selectedProxies: Array<ItemProxy> = [];
  selectedMap: Map<string, ItemProxy> = new Map();
  @Output()
  proxySelected: EventEmitter<SelectedProxyInfo> = new EventEmitter();
  repoInitialized: boolean = false;
  proxySearchControl: FormControl;
  filteredProxies: any;
  recentProxies: Array<ItemProxy>;

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
          this.filteredProxies = this.proxySearchControl.valueChanges.startWith('').
            map((text: string) => {
              return this.rootProxy.getDescendants().filter((proxy) => {
                return (-1 !== proxy.item.name.indexOf(text));
              });
            });
          this.recentProxies = this.itemRepository.getRecentProxies();
          this.recentProxies = this.recentProxies.slice().reverse();
          this.repoInitialized = true;
        }
        if (this.selection) {
          if (this.selection instanceof Array) {
            this.selectedProxies = this.selection;
            for (let i = 0; i < this.selectedProxies.length; i++) {
              let proxy = this.selectedProxies[i];
              this.selectedMap.set(proxy.item.id, proxy);
            }
          } else {
            this.selectedProxy = this.selection.selectedProxy;
          }
        }
      })
  }

  selectProxy(selection: ItemProxy) {
    if (this.multiSelect) {
      let matchesSelection: boolean = false;
      for (let i = 0; i < this.selectedProxies.length; i++) {
        let proxy = this.selectedProxies[i];
        if (proxy === selection) {
          matchesSelection = true;
          break;
        }
      }
      if (!matchesSelection) {
        this.selectedProxies.push(selection);
        this.selectedMap.set(selection.item.id, selection);
        this.proxySelected.emit({
          selectedProxies: this.selectedProxies}
        );
      }

    } else {
      this.selectedProxy = selection;
      this.proxySelected.emit({
        selectedProxy : this.selectedProxy
      })
    }
  }

  onAutoCompleteSelected(selectedProxyEvent: MatAutocompleteSelectedEvent) {
    this.selectedProxy = selectedProxyEvent.option.value;
    this.proxySelected.next(selectedProxyEvent.option.value);
    this.proxySearchControl.setValue(selectedProxyEvent.option.value.item.name);
  }

  removeSelection(selection: ItemProxy) {
    for (let i = 0; i < this.selectedProxies.length; i++) {
      let proxy = this.selectedProxies[i];
      if (proxy === selection) {
        this.selectedProxies.splice(i, 1);
        this.selectedMap.delete(selection.item.id);
      }
    }
  }
}

// TODO Need to ripple use of this interface through system or else revert to old Observable
export interface SelectedProxyInfo {
  selectedProxies? : Array<ItemProxy>,
  selectedProxy? : ItemProxy
}
