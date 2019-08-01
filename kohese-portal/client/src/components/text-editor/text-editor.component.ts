import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Optional,
  Inject, Input, OnInit, ViewChild, EventEmitter,
  Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { MarkdownService } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';

import { NotificationService } from '../../services/notifications/notification.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { SessionService } from '../../services/user/session.service';
import { ReportSpecificationComponent, ReportSpecifications } from './report-specification/report-specification.component';

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextEditorComponent implements OnInit {
  private _text: string;
  @Input('text')
  set text(text: string) {
    this._text = text;
    this._html = this._markdownService.compile(this._text);
  }

  private _html: string;
  get html() {
    return this._html;
  }
  set html(html: string) {
    this._html = html;
  }

  private _disabled: boolean = false;
  get disabled() {
    return this._disabled;
  }
  @Input('disabled')
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  private _formatText: (text: string) => string = (text: string) => {
    return text;
  };
  @Input('formatText')
  set formatText(formatText: (text: string) => string) {
    this._formatText = formatText;
  }

  private _save: (text: string) => void = (text: string) => {};
  @Input('save')
  set save(save: (text: string) => void) {
    this._save = save;
  }
  
  @ViewChild('editor')
  private _editor: EditorComponent;
  get editor() {
    return this._editor;
  }
  
  @Output('selectionChanged')
  private _selectionChangedEventEmitter: EventEmitter<any> =
    new EventEmitter<any>();
  get selectionChangedEventEmitter() {
    return this._selectionChangedEventEmitter;
  }

  get componentReference() {
    return this;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    @Optional() private _matDialogRef: MatDialogRef<TextEditorComponent>,
    private _markdownService: MarkdownService, private _itemRepository:
    ItemRepository, private _dialogService: DialogService,
    private _sessionService: SessionService,
    private _notificationService: NotificationService,
    private _toastrService: ToastrService) {
  }

  public ngOnInit(): void {
    if (this.isDialogInstance()) {
      this.text = this._data['text'];
    }
  }

  public isDialogInstance(): boolean {
    return this._matDialogRef && (this._matDialogRef.componentInstance ===
      this) && this._data;
  }

  public openFileSelector(callback: (newValue: string, additionalData:
    any) => void, currentValue: string, additionalData: any): void {
    let fileInput: any = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('multiple', 'true');
    if (additionalData.filetype === 'image') {
      fileInput.setAttribute('accept', 'image/png, image/jpeg');
      fileInput.onchange = () => {
        for (let j: number = 0; j < fileInput.files.length; j++) {
          let fileReader: FileReader = new FileReader();
          fileReader.onload = () => {
            callback(fileReader.result, {
              alt: fileInput.files[j].name,
              title: fileInput.files[j].name
            });
          };
          fileReader.readAsDataURL(fileInput.files[j]);
        }
      };
    }

    fileInput.click();
  }

  public customizeEditor(editor: any): void {
    /* Get a reference to TextEditorComponent.this, as 'this' currently
    references TinyMCE's init object. */
    let componentThis: TextEditorComponent = this.componentReference;
    editor.ui.registry.addButton('export', {
      text: 'Export',
      disabled: !componentThis._text,
      onAction: componentThis.getExportFunction(componentThis)
    });
  }

  private getExportFunction(componentThis: TextEditorComponent): (button:
    any) => void {
    return ((button: any) => {
      this._dialogService.openComponentDialog(
        ReportSpecificationComponent, {
        data: {},
        disableClose: true
      }).updateSize('40%', '40%').afterClosed().subscribe(
        (reportSpecifications: ReportSpecifications) => {
        this._notificationService.addNotifications('PROCESSING: Export Report ' +
          reportSpecifications.name);
        if (reportSpecifications) {
          this._itemRepository.getReportMetaData().then(async (reportObjects:
            Array<any>) => {
            let reportContent: string = 'Name: ' + reportSpecifications.name +
              '\n\nProduced by: ' + this._sessionService.getSessionUser().
              getValue().item.name + '\n\nProduced on: ' + new Date() +
              '\n\n' + this._formatText(this._text);
            if (reportObjects.map((reportObject: any) => {
              return reportObject.name;
            }).indexOf(reportSpecifications.name) !== -1) {
              this._dialogService.openYesNoDialog('Overwrite ' +
                reportSpecifications.name, 'A report named ' +
                reportSpecifications.name + ' already exists. Proceeding ' +
                'should overwrite that report. Do you want to proceed?').
                subscribe(async (result: any) => {
                if (result) {
                  await this._itemRepository.produceReport(reportContent,
                    reportSpecifications.name, reportSpecifications.format);
                  if (!reportSpecifications.saveReport) {
                    let downloadAnchor: any = document.createElement('a');
                    downloadAnchor.download = reportSpecifications.name;
                    downloadAnchor.href = '/producedReports/' +
                      reportSpecifications.name;
                    downloadAnchor.click();
                    await this._itemRepository.removeReport(
                      reportSpecifications.name);
                  }

                  this._toastrService.success(reportSpecifications.name,
                    'Report Produced');
                  this._notificationService.addNotifications('COMPLETED: Report Completed ' +
                    reportSpecifications.name);

                }
              });
            } else {
              await this._itemRepository.produceReport(reportContent,
                reportSpecifications.name, reportSpecifications.format);
              if (!reportSpecifications.saveReport) {
                let downloadAnchor: any = document.createElement('a');
                downloadAnchor.download = reportSpecifications.name;
                downloadAnchor.href = '/producedReports/' +
                  reportSpecifications.name;
                downloadAnchor.click();
                await this._itemRepository.removeReport(reportSpecifications.
                  name);
              }

              this._toastrService.success(reportSpecifications.name,
                'Report Produced');
              this._notificationService.addNotifications('COMPLETED: Report Completed ' +
                reportSpecifications.name);
            }
          });
        }
      });
    }).bind(componentThis);
  }

  public async saveText(): Promise<void> {
    /* Get a reference to TextEditorComponent.this, as 'this' currently
    references a TinyMCE object. */
    let componentThis: TextEditorComponent = (<any> this).settings.
      componentReference;
    componentThis._text = await componentThis._itemRepository.
      convertToMarkdown(componentThis._html, 'text/html', {});
    componentThis._save(componentThis._text);
  }
}
