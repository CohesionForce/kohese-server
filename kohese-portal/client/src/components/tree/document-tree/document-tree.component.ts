import { EventEmitter, Output, Input } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { KoheseType } from './../../../classes/UDT/KoheseType.class';
import { Observable } from 'rxjs/Observable';
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
  styleUrls: ['./document-tree.component.scss', '../tree.component.scss']
})
export class DocumentTreeComponent extends Tree implements OnInit, OnDestroy {
  treeConfigSubscription : Subscription;
  treeConfig : any;
  paramSubscription: Subscription;
  changeSubjectSubscription : Subscription;
  sync : boolean = true;

  documentRoot : ItemProxy;
  documentRootId : string;
  images = [];

  @Output()
  rootSelected : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Output()
  onSelect : EventEmitter<ItemProxy> = new EventEmitter<ItemProxy>();
  @Input()
  selectedProxyStream : Observable<ItemProxy>;
  selectedProxyStreamSubscription : Subscription;

  constructor(router: ActivatedRoute,
              dialogService : DialogService,
              private itemRepository : ItemRepository,
              private changeRef : ChangeDetectorRef
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
      if (true) {
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

      this.rootSubject.next(this.getRow(this.documentRootId));
      this.rootSelected.emit(this.documentRoot);

      this.showSelection();
      setTimeout(()=>{
        console.log(this.visibleRows)
      }, 500)
    }
  });

  this.selectedProxyStreamSubscription = this.selectedProxyStream.subscribe((newSelection) => {
    console.log(this.sync);
    if(this.sync && newSelection) {
      this._selectedIdSubject.next(newSelection.item.id)
      console.log(newSelection, this);

      this.showSelection();
    }
  })
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


  protected getId(row: TreeRow): string {
    return (row.object as ItemProxy).item.id;
  }

  protected getParent(row: TreeRow): TreeRow {
    let parent: TreeRow = undefined;
    if ((row.object as ItemProxy).parentProxy) {
      parent = this.getRow((row.object as ItemProxy).parentProxy.item.id);
    }

    return parent;
  }

  protected getChildren(row: TreeRow): Array<TreeRow> {
    let children: Array<TreeRow> = [];
    let proxy: ItemProxy = (row.object as ItemProxy);
    for (let j: number = 0; j < proxy.children.length; j++) {
      children.push(this.getRow(proxy.children[j].item.id));
    }

    return children;
  }

  protected postTreeTraversalActivity(): void {
    this.changeRef.markForCheck();
  }

  protected rowSelected(row: TreeRow): void {
    this.onSelect.emit(row.object);
  }

  protected getText(object: any): string {
    return (object as ItemProxy).item.name;
  }

  protected getIcon(object: any): string {
    let iconString: string = '';
    let koheseType: KoheseType = (object as ItemProxy).model.type;
    if (koheseType && koheseType.viewModelProxy) {
      iconString = koheseType.viewModelProxy.item.icon;
    }

    return iconString;
  }

  public setRowAsRoot(row : TreeRow) {
    this.rootSubject.next(this.getRow(row.object.item.id));
    this.rootSelected.emit(row.object);
    console.log('over');
  }
}

/*

*/
