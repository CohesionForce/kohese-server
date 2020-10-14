import { ChangeDetectorRef, EventEmitter, Output, Input, AfterViewInit,
  Component, OnInit, ElementRef, ViewChildren, QueryList, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DetailsComponent } from '../../details/details.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { DocumentInfo } from '../document-view.component';
import { Parser, HtmlRenderer } from 'commonmark';
import * as commonmark from 'commonmark';
import { FormatDefinitionType } from '../../../../../common/src/FormatDefinition.interface';
import { MatMenuTrigger } from '@angular/material';
import { NavigationService } from "../../../services/navigation/navigation.service";

@Component({
  selector: 'document-row',
  templateUrl: './document-row.component.html',
  styleUrls: ['../document-view.component.scss', './document-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentRowComponent implements OnInit, AfterViewInit {
  @Input() row;
  @Input() docInfo;
  @Input() showActions: boolean = true;
  @Output() viewInitialized: EventEmitter<ElementRef> = new EventEmitter<ElementRef>()

  docReader: Parser;
  docWriter: HtmlRenderer;
  upsertComplete: Subject<any> = new Subject();

  get itemRepository() {
    return this._itemRepository;
  }

  get FormatDefinitionType() {
    return FormatDefinitionType;
  }

  get navigationService() {
    return this._navigationService;
  }

  private _editableSet: Array<string> = [];
  get editableSet() {
    return this._editableSet;
  }

  constructor(private changeRef: ChangeDetectorRef,
    private _itemRepository: ItemRepository,
    private _dialogService: DialogService,
    private _navigationService: NavigationService,
    private element: ElementRef) {
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({ sourcepos: true},
    );
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.viewInitialized.emit(this.element);
  }

  save(proxy: ItemProxy, row: any, docInfo: DocumentInfo) {
    if(proxy.dirty === true) {
      this._itemRepository.upsertItem(proxy.kind, proxy.item).then((newProxy) => {
        row.editable = false;
        docInfo.proxy = newProxy;
        this.upsertComplete.next();
        this._editableSet.splice(this._editableSet.indexOf(proxy.item.id), 1);
        this.changeRef.markForCheck();
      });
    } else {
        row.editable = false;
        this._editableSet.splice(this._editableSet.indexOf(proxy.item.id), 1);
        this.changeRef.markForCheck();
      }
  }

  public async discardChanges(proxy: ItemProxy): Promise<void> {
    await this._itemRepository.fetchItem(this.docInfo.proxy);
    this.row.editable = false;
    this._editableSet.splice(this._editableSet.indexOf(proxy.item.id), 1);
    this.changeRef.markForCheck();
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
