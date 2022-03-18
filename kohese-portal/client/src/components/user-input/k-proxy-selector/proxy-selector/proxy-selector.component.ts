/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, startWith} from 'rxjs/operators';

// Other External Dependencies

// Kohese
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';
import { TreeService } from '../../../../services/tree/tree.service';

interface RelationInfo {
  proxy: ItemProxy;
  relationKind: string;
}

enum MoveDirection {
  UP, DOWN
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

  get MoveDirection() {
    return MoveDirection;
  }

  treeConfig: any;
  treeConfigSub: Subscription;

  constructor(private itemRepository: ItemRepository,
              private treeService: TreeService
  ) {
    this.proxySearchControl = new FormControl('');
  }

  ngOnInit() {
    this.treeConfigSub =
      this.itemRepository.getTreeConfig().subscribe((newConfig) => {
        if (newConfig) {
          this.treeConfig = newConfig.config;
          this.rootProxy = this.treeConfig.getRootProxy();
          this.recentProxies = this.treeService.getRecentProxies();
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

  /**
   * Moves the given ItemProxy one index in the direction indicated by the
   * given MoveDirection
   */
  public move(moveDirection: MoveDirection, itemProxy: ItemProxy): void {
    let candidateIndex: number = this.selected.indexOf(itemProxy);
    this.selected.splice(candidateIndex, 1);
    if (moveDirection === MoveDirection.UP) {
      this.selected.splice(candidateIndex - 1, 0, itemProxy);
    } else {
      this.selected.splice(candidateIndex + 1, 0, itemProxy);
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
