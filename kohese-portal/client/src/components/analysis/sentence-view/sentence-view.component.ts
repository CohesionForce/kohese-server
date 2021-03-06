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
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable ,  BehaviorSubject ,  Subscription } from 'rxjs';

// Other External Dependencies
import * as Mark from 'mark.js';

// Kohese
import { AnalysisViewComponent, AnalysisFilter, AnalysisViews, DataFormat } from '../AnalysisViewComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { AnalysisService } from '../../../services/analysis/analysis.service';
import { DataProcessingService } from '../../../services/data/data-processing.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { InputDialogKind } from '../../dialog/input-dialog/input-dialog.component';

@Component({
  selector: 'sentence-view',
  templateUrl : './sentence-view.component.html',
  styleUrls: [ './sentence-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentenceViewComponent extends AnalysisViewComponent
                                   implements OnInit, OnDestroy {
  /* UI Switches */
  loadLimit: number = 1000;
  ascending: boolean = true;
  sortField: string = null;
  showItemsInDetails: boolean = true;
  showSentencesInDetails: boolean = true;
  showPhrasesInDetails: boolean = false;
  showTokensInDetails: boolean = false;
  syncFilter : boolean;
  filteredCount : number;
  displayedCount : number;
  sentences: Array<any>;
  sentencesDataSource: MatTableDataSource<any>;
  filterOptions : object;
  lastFilter : AnalysisFilter;

  /* Data */
  public itemProxy: ItemProxy;

  /* Observables */
  @Input()
  public proxyStream : Observable<ItemProxy>;
  @Input()
  public filterSubject: BehaviorSubject<AnalysisFilter>;
  @Output()
  public filterUpdate = new EventEmitter<AnalysisFilter>();

  /* Subscriptions */
  private filterSubjectSubscription: Subscription;
  private proxyStreamSubscription : Subscription;

  /* Table Data and Column Definitions */
  rowDef: Array<string> = ["category", "type","text"];

  constructor(NavigationService: NavigationService, AnalysisService:
    AnalysisService, private dataProcessingService: DataProcessingService,
    private changeRef : ChangeDetectorRef, dialogService: DialogService,
    itemRepository: ItemRepository) {
    super(NavigationService, AnalysisService, dialogService, itemRepository);
  }

  ngOnInit(): void {
    this.syncFilter = true;

    this.proxyStreamSubscription = this.proxyStream.subscribe((newProxy)=>{
      this.itemProxy = newProxy;
      if (this.filterString) {
        this.onFilterChange();
        this.processSentences();
      }
      this.changeRef.markForCheck();
    })

    this.filterSubjectSubscription = this.filterSubject.subscribe(newFilter => {
      if (!this.syncFilter && newFilter.source != AnalysisViews.PHRASE_VIEW) {
        this.lastFilter = newFilter;
        return;
      } else {
        this.filterOptions = newFilter.filterOptions;
        this.filterString = newFilter.filter;
        if (this.itemProxy) {
          this.onFilterChange();
          this.processSentences();
        }
        this.changeRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.filterSubjectSubscription.unsubscribe();
  }

  onCriteriaChange() : void {
    this.processSentences();
    this.changeRef.markForCheck();
  }

  sort(property: string): void {
    if (this.sortField === property){
      if (this.ascending){
        // Change to Descending Sort
        this.ascending = false;
      } else {
        // Remove Sorting on Third Click
        this.sortField = null;
      }
    } else {
      // Establish Sorting on Property
      this.sortField = property;
      this.ascending = true;
    }
    this.processSentences();
    this.changeRef.markForCheck();
  }

  toggleLink () {
    this.syncFilter = !this.syncFilter;
    if (this.syncFilter && this.lastFilter) {
      this.filterOptions = this.lastFilter.filterOptions;
      this.filterString = this.lastFilter.filter;
      if (this.itemProxy) {
        this.onFilterChange();
        this.processSentences();
      }
      this.changeRef.markForCheck();
    }
  }

  processSentences(): void {
    let filteredList = this.dataProcessingService.filter(this.itemProxy.analysis.extendedList,
      [(listItem: any) => {

        let result =
          (((listItem.displayLevel === 1 && this.showItemsInDetails) &&
           (this.filterRegex === null ||
            this.filterRegex.test(listItem.item.name) ||
            this.filterRegex.test(listItem.item.description)))) ||
          (((listItem.displayLevel === 2 && this.showSentencesInDetails) ||
            (listItem.displayLevel === 3 && this.showPhrasesInDetails) ||
            (listItem.displayLevel === 4 && this.showTokensInDetails)) &&
          (this.filterRegex === null || this.filterRegex.test(listItem.text)));

        return result;
      }]
    );

    this.filteredCount = filteredList.length;

    if (this.sortField){
      filteredList = this.dataProcessingService.sort(filteredList, [this.sortField], this.ascending);
    }

    this.sentences = filteredList.slice(0, this.loadLimit);
    this.sentencesDataSource = new MatTableDataSource(this.sentences);
    this.displayedCount = this.sentences.length;
  }

  public sentenceCopy(): void {
    let copyEventListener: (clipboardEvent: ClipboardEvent) => void =
      (clipboardEvent: ClipboardEvent) => {
      clipboardEvent.preventDefault();

      clipboardEvent.clipboardData.setData('text/html', this.
        getSentenceTableContent(DataFormat.HTML));
      clipboardEvent.clipboardData.setData('text/plain', this.
        getSentenceTableContent(DataFormat.TXT));

      document.removeEventListener('copy', copyEventListener);
    };

    document.addEventListener('copy', copyEventListener);
    document.execCommand('copy');
  }

  private getSentenceTableContent(dataFormat: DataFormat): string {
    let content: string;
    if (dataFormat === DataFormat.HTML) {
      content = '<table><tr><th>Category</th><th>Type</th><th>Content</th>' +
        '</tr>';

      for (let j: number = 0; j < this.sentences.length; j++) {
        let type: string = this.sentences[j].displayType;
        if (((type === 'Item') && this.showItemsInDetails) || ((type ===
          'Sentence') && this.showSentencesInDetails) || ((this.sentences[j].
          displayLevel === 3) && this.showPhrasesInDetails) || ((this.sentences[
          j].displayLevel === 4) && this.showTokensInDetails)) {
          content += ('<tr><td>' + this.getCategory(this.sentences[j]) +
            '</td><td>' + type + '</td><td>' + this.sentences[j].text +
            '</td></tr>');
        }
      }

      content += '</table>';
    } else if (dataFormat === DataFormat.CSV) {
      content = 'Category,Type,Content';

      for (let j: number = 0; j < this.sentences.length; j++) {
        let type: string = this.sentences[j].displayType;
        if (((type === 'Item') && this.showItemsInDetails) || ((type ===
          'Sentence') && this.showSentencesInDetails) || ((this.sentences[j].
          displayLevel === 3) && this.showPhrasesInDetails) || ((this.sentences[
          j].displayLevel === 4) && this.showTokensInDetails)) {
          content += (this.getCategory(this.sentences[j]) + ',' + type + ',\"'
            + this.sentences[j].text.replace(/"/g, '\"\"') + '\"\n');
        }
      }
    } else {
      // Limit total width to 80 characters
      content = 'Category   Type                              ' +
        'Content\n\n';

      for (let j: number = 0; j < this.sentences.length; j++) {
        let type: string = this.sentences[j].displayType;
        if (((type === 'Item') && this.showItemsInDetails) || ((type ===
          'Sentence') && this.showSentencesInDetails) || ((this.sentences[j].
          displayLevel === 3) && this.showPhrasesInDetails) || ((this.
          sentences[j].displayLevel === 4) && this.showTokensInDetails)) {
          let sentence: any = this.sentences[j];
          let category: string = this.getCategory(sentence);
          for (let k: number = category.length; k < 8; k++) {
            category += ' ';
          }

          content += (category + '   ');

          let typeRemainder: string = type;
          let contentRemainder: string = sentence.text;
          for (let k: number = (contentRemainder.length - 1); k >= 0; k--) {
            if ((contentRemainder.charAt(k) === '\n') && (k !==
              contentRemainder.length)) {
              contentRemainder = (contentRemainder.substring(0, k + 1) +
                '                                             ' +
                contentRemainder.substring(k + 1));
            }
          }

          let afterFirstLine: boolean = false;
          while (typeRemainder || contentRemainder) {
            if (afterFirstLine) {
              content += '           ';
            }

            if (typeRemainder.length < 31) {
              for (let k: number = typeRemainder.length; k < 31; k++) {
                typeRemainder += ' ';
              }
            }

            content += (typeRemainder.substring(0, 31) + '   ');
            typeRemainder = typeRemainder.substring(31);

            if (contentRemainder.length < 34) {
              for (let k: number = contentRemainder.length; k < 34; k++) {
                contentRemainder += ' ';
              }
            }

            content += contentRemainder.substring(0, 34);
            contentRemainder = contentRemainder.substring(34);

            content += '\n';

            afterFirstLine = true;
          }

          content += '\n';
        }
      }
    }

    return content;
  }

  public async sentenceExport(dataFormat: DataFormat): Promise<void> {
    let name: any = await this.dialogService.openInputDialog('Export', '',
      InputDialogKind.STRING, 'Name', this.itemProxy.item.name + '_' + new Date().
      toISOString() + '.' + dataFormat.toLowerCase(), (input: any) => {
      return (input && (input.search(/[\/\\]/) === -1));
    });
    if (name) {
      await this.itemRepository.produceReport(this.getSentenceTableContent(
        dataFormat), name, 'text/markdown');
      let downloadAnchor: any = document.createElement('a');
      downloadAnchor.download = name;
      downloadAnchor.href = '/producedReports/' + name;
      downloadAnchor.click();
    }
  }

  public highlight(element: any): void {
    let highlightContext: any = new Mark('document-row h1, document-row h2, ' +
      'document-row h3, document-row h4, document-row h5, document-row h6, '+
      'document-row markdown');
    highlightContext.unmark({});
    let scrollToFirstMatch: boolean = true;
    highlightContext.mark(element.text, {
      separateWordSearch: false,
      each: (element: any) => {
        if (scrollToFirstMatch) {
          element.scrollIntoView();
          scrollToFirstMatch = false;
        }
      }
    });
  }

  public getCategory(element: any): string {
    switch (element.displayLevel) {
      case 1:
        return 'Item';
      case 2:
        return 'Sentence';
      case 3:
        return 'Phrase';
      case 4:
        return 'Term';
    }

    return '';
  }
}
