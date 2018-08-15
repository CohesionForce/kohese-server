import { Subject } from 'rxjs';
import {
  DialogService
} from '../../../services/dialog/dialog.service';
import {
  ItemRepository
} from '../../../services/item-repository/item-repository.service';
import {
  DetailsDialogComponent
} from '../../details/details-dialog/details-dialog.component';
import {
  ItemProxy
} from '../../../../../common/src/item-proxy';
import {
  ChangeDetectorRef,
  EventEmitter,
  Output,
  Input,
  AfterViewInit,
  Component,
  OnInit,
  ElementRef
} from '@angular/core';
import {
  DocumentInfo
} from '../document-view.component';
import {
  Parser,
  HtmlRenderer
} from 'commonmark';
import * as commonmark from 'commonmark';

@Component({
  selector: 'document-row',
  templateUrl: './document-row.component.html',
  styleUrls: ['../document-view.component.scss', './document-row.component.scss']
})
export class DocumentRowComponent implements OnInit, AfterViewInit {
  @Input() row;
  @Input() docInfo;
  @Output() viewInitialized: EventEmitter < ElementRef > = new EventEmitter < ElementRef > ()

  docReader: Parser;
  docWriter: HtmlRenderer;
  upsertComplete : Subject<any> = new Subject();

  constructor(private changeRef: ChangeDetectorRef,
              private itemRepository: ItemRepository,
              private dialogService: DialogService,
              private element: ElementRef) {
    this.docReader = new commonmark.Parser();
    this.docWriter = new commonmark.HtmlRenderer({
      sourcepos: true
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.viewInitialized.emit(this.element);
  }

  upsertItem(proxy: ItemProxy, row: any, docInfo: DocumentInfo) {
    this.itemRepository.upsertItem(proxy).then((newProxy) => {
      row.editable = false;
      docInfo.proxy = newProxy;
      this.upsertComplete.next();
      this.changeRef.markForCheck();
    })
  }

  showProxyDetails(proxy: ItemProxy) {
    this.dialogService.openComponentDialog(DetailsDialogComponent, {
        data: {
          itemProxy: proxy,
          hideDocument: true
        }
      }).updateSize('80%', '80%')
      .afterClosed().subscribe((results) => {
        // Probably need to do something here to spin off an update
      });
  }

  insertRow(newProxy: ItemProxy, row: any, location: string) {
    row[location] = false;
    this.changeRef.markForCheck();
    // TODO fix this
  }


}
