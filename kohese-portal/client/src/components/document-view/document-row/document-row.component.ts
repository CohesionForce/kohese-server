import {
  DialogService
} from './../../../services/dialog/dialog.service';
import {
  ItemRepository
} from './../../../services/item-repository/item-repository.service';
import {
  DetailsDialogComponent
} from './../../details/details-dialog/details-dialog.component';
import {
  ItemProxy
} from './../../../../../common/src/item-proxy';
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
      let rendered = '';
      row.editable = false;
      docInfo.proxy = newProxy;

      // TODO : Update to new render methodology re: Format Def
      if (docInfo.depth > 0) {
        // Show the header for any node that is not the root of the document

        rendered = '<h' + docInfo.depth + '>' + docInfo.proxy.item.name + '</h' + docInfo.depth + '>';
      }
      if (docInfo.proxy.item.description) {
        // Show the description if it exists
        let nodeParsed = this.docReader.parse(docInfo.proxy.item.description);
        rendered += this.docWriter.render(nodeParsed);
      }
      docInfo.rendered = rendered;
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
