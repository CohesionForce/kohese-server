import { ChangeDetectorRef, EventEmitter, Output, Input, AfterViewInit,
  Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DetailsComponent } from '../../details/details.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { DocumentInfo } from '../document-view.component';
import { Parser, HtmlRenderer } from 'commonmark';
import * as commonmark from 'commonmark';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { MatDialog, MatDialogConfig, MatExpansionPanel, MatMenuTrigger } from '@angular/material';
import { NavigationService } from "../../../services/navigation/navigation.service";
import { FormatObjectEditorComponent } from '../../object-editor/format-object-editor/format-object-editor.component';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';
import { SessionService } from '../../../services/user/session.service';
import { JournalComponent, JournalOrdering } from '../../details/journal/journal.component';

@Component({
  selector: 'document-row',
  templateUrl: './document-row.component.html',
  styleUrls: ['../document-view.component.scss', './document-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentRowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() row;
  @Input() docInfo;
  @Input() showActions: boolean = true;
  @Output() viewInitialized: EventEmitter<ElementRef> = new EventEmitter<ElementRef>()

  /* Variable Declarations */
  docReader: Parser;
  docWriter: HtmlRenderer;
  upsertComplete: Subject<any> = new Subject();
  observationsPresent: boolean = false;
  private treeConfig;
  private treeConfigSub;
  private treeConfigProxyChangeSub;

  /* Getters */
  get itemRepository() {
    return this._itemRepository;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get navigationService() {
    return this._navigationService;
  }

  constructor(
    private changeRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository,
    private _dialogService: DialogService,
    private _navigationService: NavigationService,
    private element: ElementRef,
    private sessionService: SessionService,
    private dialog: MatDialog
    ) {
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({ sourcepos: true},
    );
  }

   ngOnInit() {
    this.treeConfigSub = this._itemRepository.getTreeConfig().subscribe(
      (treeConfigurationObject: any) => {
      this.treeConfig = treeConfigurationObject.config;

      if (this.treeConfigProxyChangeSub) {
        this.treeConfigProxyChangeSub.unsubscribe();
      }
      this.treeConfigProxyChangeSub = this.treeConfig.getChangeSubject()
        .subscribe((notification: any) => {
          if(notification.id === this.docInfo.proxy.item.id) {
            switch (notification.type) {
              case 'create':
              case 'update':
              case 'dirty':
              case 'delete': {
                this.changeRef.markForCheck();
                break;
              }
            }
          }
          this.checkEntries();
          this.changeRef.markForCheck();
        });
        this.checkEntries();
        this.changeRef.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    if (this.treeConfigProxyChangeSub) {
      this.treeConfigProxyChangeSub.unsubscribe();
    }
    if(this.treeConfigSub) {
      this.treeConfigSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.viewInitialized.emit(this.element);
  }

  save(proxy: ItemProxy, row: any, docInfo: DocumentInfo) {
    if(proxy.dirty === true) {
      this._itemRepository.upsertItem(proxy.kind, proxy.item).then((newProxy) => {
        docInfo.proxy = newProxy;
        this.upsertComplete.next();
      });
    }
    row.editable = false;
    this.checkEntries();
    this.changeRef.markForCheck();
  }

  public async discardChanges(proxy: ItemProxy): Promise<void> {
    await this._itemRepository.fetchItem(this.docInfo.proxy);
    this.row.editable = false;
    this.checkEntries();
    this.changeRef.markForCheck();
  }

  numEntries: number = 0;
  public checkEntries() {
    this.numEntries = 0;
    let observationRelation = this.docInfo.proxy.relations.referencedBy.Observation;
    let issueRelation = this.docInfo.proxy.relations.referencedBy.Issue;

    if(observationRelation && observationRelation.context) {
      this.numEntries += observationRelation.context.length;
    }
    if(issueRelation && issueRelation.context) {
      this.numEntries += issueRelation.context.length;
    }
    if(this.numEntries > 0) {
      this.observationsPresent = true;
    }
  }

  public addEntry(docInfo: DocumentInfo): void {
    let username: string = this.sessionService.user.name;
    let timestamp: number = Date.now();
    this._dialogService.openComponentDialog(FormatObjectEditorComponent, {
      data: {
        type: TreeConfiguration.getWorkingTree().getProxyFor('Observation').item,
        object: {
          createdOn: timestamp,
          createdBy: username,
          modifiedOn: timestamp,
          modifiedBy: username,
          parentId: docInfo.proxy.item.id,
          context: [{ id: docInfo.proxy.item.id }],
          observedBy: username,
          observedOn: timestamp
        },
        formatDefinitionType: FormatDefinitionType.DEFAULT,
        allowKindChange: true
      }
    }).updateSize('90%', '90%').afterClosed().subscribe(async (result: any) => {
      if (result) {
        await this._itemRepository.upsertItem(result.type.name, result.object);
        this.checkEntries();
        this.changeRef.markForCheck();
      }
    });
  }

  public displayJournal(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: {
        itemProxy: itemProxy,
        startWithJournal: true
      }
    }).updateSize('90%', '90%');
  }

  public displayInformation(itemProxy: ItemProxy): void {
    this._dialogService.openComponentDialog(DetailsComponent, {
      data: { itemProxy: itemProxy }
    }).updateSize('90%', '90%');
  }

  @ViewChildren(MatMenuTrigger)
  contextMenu: QueryList<MatMenuTrigger>;
  onContextMenu(event: MouseEvent, contextMenuComponent: HTMLDivElement, itemProxy: ItemProxy) {
    event.preventDefault();
    contextMenuComponent.style.left = event.clientX + 'px';
    contextMenuComponent.style.top = event.clientY + 'px';
    this.contextMenu.toArray()[0].openMenu();
  }
}
