import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ActivatedRoute } from '@angular/router';
import { ItemProxy } from 'common/src/item-proxy';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fullscreen-document',
  templateUrl: './fullscreen-document.component.html',
  styleUrls: ['./fullscreen-document.component.scss']
})
export class FullscreenDocumentComponent implements OnInit {
  proxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  selectedProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  documentProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  paramSubscription : Subscription;
  treeConfigSubscription : Subscription;
  documentRootId : string;
  documentRoot

  constructor(private router : ActivatedRoute, private itemRepository: ItemRepository) { }

  ngOnInit() {
    this.paramSubscription = this.router.params.subscribe(params => {
      if (params['id']) {
       this.documentRootId = params['id'];
      }
    });

    this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe((newConfig) => {
      if (newConfig) {
        this.documentRoot = newConfig.config.getProxyFor(this.documentRootId);
        this.proxyStream.next(this.documentRoot);
      }
    })
  }

  setRoot(newRoot: ItemProxy) {
    this.proxyStream.next(newRoot)
  }

}
