import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { ItemRepository, RepoStates } from '../../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { Subscription } from 'rxjs';

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
  @Output()
  proxySelected: EventEmitter<any> = new EventEmitter();

  rootProxy: ItemProxy;
  selected : any;
  selectedMap: Map<string, ItemProxy> = new Map();
  repoInitialized: boolean = false;
  proxySearchControl: FormControl;
  proxySearchInitialized : boolean;
  treeInitialized : boolean;
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
          this.recentProxies = this.itemRepository.getRecentProxies();
          this.recentProxies = this.recentProxies.slice().reverse();
          this.repoInitialized = true;
        }
        if (this.selection) {
          if (this.multiSelect) {
            this.selected = this.selection;
            for (let i = 0; i < this.selected.length; i++) {
              let proxy = this.selected[i];
              this.selectedMap.set(proxy.item.id, proxy);
            }
          } else {
            this.selected = this.selection;
          }
        }
      })
  }

  initProxySearch() {
    if (!this.proxySearchInitialized) {
      this.filteredProxies = this.proxySearchControl.valueChanges.startWith('').
        map((text: string) => {
          return this.rootProxy.getDescendants().filter((proxy) => {
            return (-1 !== proxy.item.name.indexOf(text));
          });
      });
    }
    this.proxySearchInitialized = true;
  }

  selectProxy(selection: ItemProxy) {
    console.log(selection);
    if (this.multiSelect) {
      let matchesSelection: boolean = false;
      for (let i = 0; i < this.selected.length; i++) {
        let proxy = this.selected[i];
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
      this.proxySelected.emit(this.selected)
    }
  }

  onAutoCompleteSelected(selectedProxyEvent: MatAutocompleteSelectedEvent) {
    this.selected = selectedProxyEvent.option.value;
    this.proxySelected.next(selectedProxyEvent.option.value);
    this.proxySearchControl.setValue(selectedProxyEvent.option.value.item.name);
  }

  onTabSelected(tabEvent) {
    switch(tabEvent.index) {
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
        let proxy = this.selected[i];
        if (proxy === selection) {
          this.selected.splice(i, 1);
          this.selectedMap.delete(selection.item.id);
        }
      }
    }
  }
}
