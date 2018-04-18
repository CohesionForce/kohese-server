import { Component, OnInit, OnDestroy, Input, OnChanges,
  SimpleChanges } from '@angular/core';

import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import { ProxySelectorDialogComponent } from '../../user-input/k-proxy-selector/proxy-selector-dialog/proxy-selector-dialog.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  public itemProxy: ItemProxy;
  private initialized: boolean = false;
  private journalEntries: Array<ItemProxy> = [];
  public filteredEntries: Array<ItemProxy> = [];
  public journalTargetId: string = undefined;
  private _observationName: string = '';
  get observationName() {
    return this._observationName;
  }
  set observationName(observationName: string) {
    this._observationName = observationName;
  }
  public journalEntryContent: string = '';
  public readonly SORT_STRATEGIES: any = {
    eldestFirstWhenObserved: 'Eldest First When Observed',
    eldestLastWhenObserved: 'Eldest Last When Observed',
    eldestFirstJournalEntryMade: 'Eldest First Journal Entry Made',
    eldestLastJournalEntryMade: 'Eldest Last Journal Entry Made',
    observer: 'Observer',
    journalEntryMaker: 'Journal Entry Maker',
    issuesFirst: 'Issues First',
    issuesLast: 'Issues Last'
  };
  public selectedSortStrategy: string = Object.keys(this.SORT_STRATEGIES)[0];
  private userProxies: Array<ItemProxy>;
  private _filteredUserProxies: Array<ItemProxy>;
  get filteredUserProxies() {
    return this._filteredUserProxies;
  }
  observingUser: string;
  public dateObserved: string;
  public timeObserved: string;
  private _observingActivity: ItemProxy;
  get observingActivity() {
    return this._observingActivity;
  }
  public addAsIssue: boolean = false;
  private observationFilterText: string = '';
  
  private repositoryStatusSubscription: Subscription;
  
  constructor(private itemRepository: ItemRepository,
    private sessionService: SessionService,
    private _dialogService: DialogService) {
  }
  
  ngOnInit(): void {
    let now: Date = new Date();
    this.dateObserved = now.getFullYear() + '-' + ((now.getMonth() + 1) < 10 ?
      '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + '-' +
      (now.getDate() < 10 ? '0' + now.getDate() : now.getDate());
    this.timeObserved = (now.getHours() < 10 ? '0' + now.getHours() :
      now.getHours()) + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() :
      now.getMinutes()) + ':' + (now.getSeconds() < 10 ?
      '0' + now.getSeconds() : now.getSeconds());
    
    let type: string = this.itemProxy.kind;
    if ((type === 'Task') || (type === 'Action')) {
      this._observingActivity = this.itemProxy;
    }
    
    this.repositoryStatusSubscription = this.itemRepository.
      getRepoStatusSubject().subscribe((statusObject: any) => {
      if (RepoStates.SYNCHRONIZATION_SUCCEEDED === statusObject.state) {
        this.userProxies = this.sessionService.getUsers();
        this.observingUser = this.sessionService.getSessionUser().getValue().
          item.name;
        console.log('ObservingUser');
        console.log(this.sessionService.getSessionUser().getValue());
      }
    });
    
    this.refresh();
    
    this.initialized = true;
  }
  
  ngOnDestroy(): void {
    this.repositoryStatusSubscription.unsubscribe();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      this.itemProxy = changes['itemProxy'].currentValue;
      this.refresh();
    }
  }
  
  refresh(): void {
    this.journalTargetId = this.itemProxy.item.id;
    this.journalEntries = [];
    this.addObservations(this.itemProxy);
    this.filterObservations(this.observationFilterText);
    this.sort(this.selectedSortStrategy);
  }
  
  addObservations(proxy: ItemProxy): void {
    let referringContexts: Array<ItemProxy> = [];
    let referringTypes: any = proxy.relations['referencedBy'];
    for (let type in referringTypes) {
      let referringTypeContexts: ItemProxy = referringTypes[type]['context'];
      if (referringTypeContexts) {
        referringContexts.splice(referringContexts.length - 1, 0,
          ...referringTypeContexts);
      }
    }
    
    for (let j: number = 0; j < referringContexts.length; j++) {
      let referringProxy: ItemProxy = referringContexts[j];
      if (('Observation' === referringProxy.kind) ||
        ('Issue' === referringProxy.kind)) {
        this.journalEntries.push(referringProxy);
        this.addObservations(referringProxy);
      }
    }
  }
  
  addJournalEntry(): void {
    let whenObserved: Date;
    if (this.dateObserved) {
      whenObserved = new Date(this.dateObserved);
    } else {
      whenObserved = new Date();
    }
    // Handle the timezone offset
    whenObserved.setTime(whenObserved.getTime() +
      (whenObserved.getTimezoneOffset() * 60 * 1000));
    let hour: number;
    let minutes: number;
    if (this.timeObserved) {
      let timeComponents: Array<string> = this.timeObserved.split(' ');
      let hms: Array<string> = timeComponents[0].split(':');
      hour = parseInt(hms[0]);
      if ('PM' === timeComponents[1]) {
        hour += 12;
      }
      minutes = parseInt(hms[1]);
    } else {
      let d: Date = new Date();
      hour = d.getHours();
      minutes = d.getMinutes();
    }
    
    whenObserved.setHours(hour);
    whenObserved.setMinutes(minutes);
    
    let observation: any = {
      name: this._observationName,
      description: this.journalEntryContent,
      observedBy: this.observingUser,
      observedOn: whenObserved.getTime(),
      context: this.journalTargetId,
      parentId: this._observingActivity.item.id
    };
    let type: string;
    if (this.addAsIssue) {
      type = 'Issue';
      observation.issueState = 'Observed';
    } else {
      type = 'Observation';
    }
    this.itemRepository.buildItem(type, observation).then(
      (proxy: ItemProxy) => {
      this._observationName = '';
      this.journalEntryContent = '';
      this.refresh();
    });
  }
  
  sort(strategy: string): void {
    this.selectedSortStrategy = strategy;
    let strategyKeys: Array<string> = Object.keys(this.SORT_STRATEGIES);
    let eldestFirst: boolean = true;
    let timeBased: boolean = true;
    let timeSortField: string = 'observedOn';
    let userBased: boolean = false;
    let userSortField: string = 'observedBy';
    let typeBased: boolean = false;
    let issuesFirst: boolean = true;
    
    let index: number = strategyKeys.indexOf(strategy);
    if (index > 3) {
      timeBased = false;
      if (index > 5) {
        typeBased = true;
        if (7 === index) {
          issuesFirst = false;
        }
      } else {
        userBased = true;
        if (5 === index) {
          userSortField = 'createdBy';
        }
      }
    } else {
      if (index > 1) {
        timeSortField = 'createdOn';
        if (strategy === strategyKeys[3]) {
          eldestFirst = false;
        }
      } else {
        if (strategy === strategyKeys[1]) {
          eldestFirst = false;
        }
      }
    }
    
    this.filteredEntries.sort((entryOne: ItemProxy, entryTwo: ItemProxy) => {
      let compareValue: number = 0;
      if (timeBased) {
        compareValue = (entryOne.item[timeSortField] >
          entryTwo.item[timeSortField] ? 1 : (entryOne.item[timeSortField] <
          entryTwo.item[timeSortField] ? -1 : 0));
        if (!eldestFirst) {
          compareValue = -compareValue;
        }
      } else if (typeBased) {
        if (entryOne.kind !== entryTwo.kind) {
          compareValue = (('Issue' === entryOne.kind) ? -1 : 1);
          if (!issuesFirst) {
            compareValue = -compareValue;
          }
        }
      } else {
        compareValue = (entryOne.item[userSortField] >
          entryTwo.item[userSortField] ? 1 : (entryOne.item[userSortField] <
          entryTwo.item[userSortField] ? -1 : 0));
      }
      
      return compareValue;
    });
  }
  
  filterObservations(filterText: string): void {
    this.observationFilterText = filterText;
    this.filteredEntries = [];
    for (let j: number = 0; j < this.journalEntries.length; j++) {
      let entry: ItemProxy = this.journalEntries[j];
      if ((!entry.item.description) || (-1 !== entry.item.description.
        indexOf(this.observationFilterText))) {
        this.filteredEntries.push(this.journalEntries[j]);
      }
    }
  }
  
  filterUsers(text: string): void {
    this._filteredUserProxies = this.userProxies.filter((proxy: ItemProxy) => {
      return (-1 !== proxy.item.name.indexOf(text));
    });
  }
  
  public openObservingActivitySelectionDialog(): void {
    this._dialogService.openComponentDialog(ProxySelectorDialogComponent, {
      data: {}
    }).updateSize('70%', '70%').afterClosed().subscribe((proxy: ItemProxy) => {
      if (proxy) {
        this._observingActivity = proxy;
      }
    });
  }
}