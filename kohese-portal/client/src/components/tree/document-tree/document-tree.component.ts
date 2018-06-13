import { Observable } from 'rxjs/Observable';
import { Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeRow } from './../tree-row.class';
import { RowAction, MenuAction } from './../tree-row.component';
import { ItemProxy } from './../../../../../common/src/item-proxy';
import { DialogService } from './../../../services/dialog/dialog.service';
import { ItemRepository } from './../../../services/item-repository/item-repository.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tree } from '../tree.class';

@Component({
  selector: 'document-tree',
  templateUrl: './document-tree.component.html',
  styleUrls: ['./document-tree.component.scss']
})
export class DocumentTreeComponent extends Tree implements OnInit, OnDestroy {
  treeConfigSubscription : Subscription;
  treeConfig : any;
  paramSubscription: Subscription;
  changeSubjectSubscription : Subscription;
  sync : boolean = true;

  documentRoot : ItemProxy;
  documentRootId : string;

  constructor(router: ActivatedRoute,
              dialogService : DialogService,
              private itemRepository : ItemRepository
              ) {
                super(router, dialogService);
              }

  ngOnInit() {
    this.paramSubscription = this._route.params.subscribe(params => {
      if (params['id']) {
       this.documentRootId = params['id'];
      }
    });

    console.log(this.documentRoot)
  this.rootRowActions.push(new RowAction('Test action',
    'I am an action', 'fa fa-times', (row : TreeRow) => {
      return true;
    }, ()=>{return true}));

  let sharedAction : MenuAction = new MenuAction('Menu Action', 'I am in a menu', 'fa fa-comment',
    (row) => {
      if (row.itemProxy.kind === 'Item') {
        return true
      }},()=>{console.log('Hello world')})

  this.rootMenuActions.push(sharedAction);
  this.menuActions.push(sharedAction);

  this.treeConfigSubscription = this.itemRepository.getTreeConfig()
    .subscribe((treeConfigurationObject: any) => {
    this.treeConfig = treeConfigurationObject;
    if (this.treeConfig) {
      this.documentRoot = this.treeConfig.config.getProxyFor(this.documentRootId);
      this.documentRoot.visitTree({ includeOrigin: true }, (proxy:ItemProxy) => {
        this.buildRow(proxy);
      });

      if (this.changeSubjectSubscription) {
        this.changeSubjectSubscription.unsubscribe();
      }
      this.changeSubjectSubscription = treeConfigurationObject.config.
        getChangeSubject().subscribe((notification: any) => {
        switch (notification.type) {
          case 'create': {
              this.insertRow(notification.proxy);
              this.refresh();
            }
            break;
          case 'delete': {
              this.deleteRow(notification.id);
              this.refresh();
            }
            break;
          case 'loaded': {
              this.documentRoot.visitTree({ includeOrigin: true }, (proxy:
                ItemProxy) => {
                this.buildRow(proxy);
              });
              this.refresh();
              this.showSelection();
            }
            break;
        }
      });

      this._rootSubject.next(this.getRow(this.documentRootId));

      // this._route.params.subscribe((parameters) => {
      //   if () {
      //     this.showSelection();
      //   }
      // });

      this.showSelection();
    }
  });
}

  ngOnDestroy () {
    this.prepareForDismantling();
    if (this.treeConfigSubscription) {
      this.treeConfigSubscription.unsubscribe();
    }
    this.changeSubjectSubscription.unsubscribe();
  }


  toggleDocumentSync(): void {
    this.sync = !this.sync;
    if (this.sync) {
      this.showSelection();
    }
  }

}

/*

*/
