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


import { Injectable } from '@angular/core';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { AnalysisService } from '../../services/analysis/analysis.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { InputDialogKind } from '../dialog/input-dialog/input-dialog.component';

export enum DataFormat {
  HTML = 'HTML', CSV = 'CSV', TXT = 'TXT'
}

/* Here is where we will setup the base methods for all the analysis components */

@Injectable()
export class AnalysisViewComponent extends NavigatableComponent {
  protected filterString: string;
  protected filterRegex: RegExp;
  filterRegexHighlighted: RegExp;
  invalidFilterRegex: boolean
  termPOSFilterCriteriaList: Array<any>;
  phrasePOSFilterCriteriaList: Array<any>;
  analysisPOSFilterName: string = 'Standard';

  get DataFormat() {
    return DataFormat;
  }

  get Object() {
    return Object;
  }

  constructor(NavigationService: NavigationService, protected AnalysisService:
    AnalysisService, protected dialogService: DialogService,
    protected itemRepository: ItemRepository) {
    super(NavigationService);

    this.termPOSFilterCriteriaList = Object.keys(AnalysisService.termFilterCriteria);
    this.phrasePOSFilterCriteriaList = Object.keys(AnalysisService.phraseFilterCriteria);

  }

  onFilterChange () : void {
    console.log('>>> Filter string changed to: ' + this.filterString);

    var regexFilter = /^\/(.*)\/([gimy]*)$/;
    var filterIsRegex = this.filterString.match(regexFilter);

    if (filterIsRegex) {
      try {
        this.filterRegex = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        this.filterRegexHighlighted = new RegExp('(' + filterIsRegex[1] + ')', 'g' + filterIsRegex[2]);
        this.invalidFilterRegex = false;
      } catch (e) {
        this.invalidFilterRegex = true;
      }
    } else {
      let cleanedPhrase = this.filterString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (this.filterString !== '') {
        this.filterRegex = new RegExp(cleanedPhrase, 'i');
        this.filterRegexHighlighted = new RegExp('(' + cleanedPhrase + ')', 'gi');
        this.invalidFilterRegex = false;
      } else {
        this.filterRegex = null;
        this.filterRegexHighlighted = null;
        this.invalidFilterRegex = false;
      }
    }
  }

  public copy(elements: Array<any>, includePartsOfSpeech: boolean): void {
    let copyEventListener: (clipboardEvent: ClipboardEvent) => void =
      (clipboardEvent: ClipboardEvent) => {
      clipboardEvent.preventDefault();

      clipboardEvent.clipboardData.setData('text/html', this.getTableContent(
        elements, includePartsOfSpeech, DataFormat.HTML));
      clipboardEvent.clipboardData.setData('text/plain', this.getTableContent(
        elements, includePartsOfSpeech, DataFormat.TXT));

      document.removeEventListener('copy', copyEventListener);
    };

    document.addEventListener('copy', copyEventListener);
    document.execCommand('copy');
  }

  private getTableContent(elements: Array<any>, includePartsOfSpeech: boolean,
    dataFormat: DataFormat): string {
    let content: string;
    if (dataFormat === DataFormat.HTML) {
      content = '<table><tr><th>Element</th><th>Number Of ' +
        'Occurrences</th>' + (includePartsOfSpeech ?
        '<th>Parts of Speech</th>' : '') + '</tr>';

      for (let j: number = 0; j < elements.length; j++) {
        content += ('<tr><td>' + elements[j].text + '</td><td>' + elements[
          j].count + '</td>' + (includePartsOfSpeech ? ('<td>' + JSON.
          stringify(elements[j].posCount) + '</td>') : '') + '</tr>');
      }

      content += '</table>';
    } else if (dataFormat === DataFormat.CSV) {
      content = 'Element,Number Of Occurrences' + (includePartsOfSpeech ?
        ',Parts of Speech' : '') + '\n';

      for (let j: number = 0; j < elements.length; j++) {
        content += (elements[j].text + ',' + elements[j].count +
          (includePartsOfSpeech ? (',\"' + JSON.stringify(elements[j].
          posCount) + '\"') : '') + '\n');
      }
    } else {
      // Limit total width to 80 characters
      content = 'Element                   Number Of Occurrences' +
        (includePartsOfSpeech ? '     Parts of Speech' : '') + '\n\n';

      for (let j: number = 0; j < elements.length; j++) {
        let element: any = elements[j];
        let elementRemainder: string = element.text;
        let numberOfOccurrencesRemainder: string = String(element.count);
        let partsOfSpeechRemainder: string = JSON.stringify(element.posCount);
        while (elementRemainder || numberOfOccurrencesRemainder ||
          (includePartsOfSpeech && partsOfSpeechRemainder)) {
          if (elementRemainder.length < 23) {
            for (let k: number = elementRemainder.length; k < 23; k++) {
              elementRemainder += ' ';
            }
          }

          content += elementRemainder.substring(0, 23) + '   ';
          elementRemainder = elementRemainder.substring(23);

          if (numberOfOccurrencesRemainder.length < 23) {
            for (let k: number = numberOfOccurrencesRemainder.length; k < 23;
              k++) {
              numberOfOccurrencesRemainder += ' ';
            }
          }

          content += numberOfOccurrencesRemainder.substring(0, 23);
          numberOfOccurrencesRemainder = numberOfOccurrencesRemainder.
            substring(23);

          if (includePartsOfSpeech) {
            if (partsOfSpeechRemainder.length < 26) {
              for (let k: number = partsOfSpeechRemainder.length; k < 26;
                k++) {
                partsOfSpeechRemainder += ' ';
              }
            }

            content += ('   ' + partsOfSpeechRemainder.substring(0, 26));
            partsOfSpeechRemainder = partsOfSpeechRemainder.substring(26);
          }

          content += '\n';
        }

        content += '\n';
      }
    }

    return content;
  }

  public async export(elements: Array<any>, includePartsOfSpeech: boolean,
    baseItemName: string, dataFormat: DataFormat): Promise<void> {
    let name: any = await this.dialogService.openInputDialog('Export', '',
      InputDialogKind.STRING, 'Name', baseItemName + '_' + new Date().
      toISOString() + '.' + dataFormat.toLowerCase(), (input: any) => {
      return (input && (input.search(/[\/\\]/) === -1));
    });
    if (name) {
      await this.itemRepository.produceReport(this.getTableContent(elements,
        includePartsOfSpeech, dataFormat), name, 'text/markdown');
      let downloadAnchor: any = document.createElement('a');
      downloadAnchor.download = name;
      downloadAnchor.href = '/producedReports/' + name;
      downloadAnchor.click();
    }
  }
}

export enum AnalysisViews {
  TERM_VIEW,
  SENTENCE_VIEW,
  PHRASE_VIEW,
  DOCUMENT_VIEW
}

export interface AnalysisFilter {
  source : AnalysisViews,
  filter : string,
  filterOptions : {
    exactMatch: boolean,
    ignoreCase: boolean
  }
}
