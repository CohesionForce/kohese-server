// Angular
import { Component, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';

// NPM
import { BehaviorSubject, Subscription } from 'rxjs';

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { ActivatedRoute } from '@angular/router';
import { ItemProxy } from '../../../../../common/src/item-proxy';

@Component({
  selector: 'document-outline',
  templateUrl: './document-outline.component.html',
  styleUrls: ['./document-outline.component.scss']
})
export class DocumentOutlineComponent implements OnInit {
  proxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  selectedProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  documentProxyStream : BehaviorSubject<ItemProxy> = new BehaviorSubject<ItemProxy>(undefined)
  paramSubscription : Subscription;
  treeConfigSubscription : Subscription;
  documentRootId : string;
  documentRoot

  @Output() outlineView: boolean = true;

  constructor(
    private router : ActivatedRoute,
    private itemRepository : ItemRepository,
    private title : Title
    ) {
      this.title.setTitle("Outline");
    }

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
