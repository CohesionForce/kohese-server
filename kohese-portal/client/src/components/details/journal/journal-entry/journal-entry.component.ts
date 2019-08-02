import { Component, Input, Output, EventEmitter, OnInit, OnChanges,
  SimpleChanges } from '@angular/core';
import { SessionService } from '../../../../services/user/session.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../../common/src/item-proxy';

@Component({
  selector: 'journal-entry',
  templateUrl: './journal-entry.component.html',
  styleUrls: ['../journal.component.scss']
})
export class JournalEntryComponent implements OnInit, OnChanges {
  @Input()
  public itemProxy: ItemProxy;
  @Output()
  public journalTarget: EventEmitter<string> = new EventEmitter<string>();
  @Input()
  public journalTargetId: string = undefined;
  private initialized: boolean = false;
  public inEditMode: boolean = false;
  public editText: string;
  
  constructor(public sessionService: SessionService,
    private itemRepository: ItemRepository,
    public navigationService: NavigationService) {
  }
  
  ngOnInit(): void {
    this.editText = this.itemProxy.item.description;
    this.initialized = true;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      if (changes['itemProxy']) {
        this.itemProxy = changes['itemProxy'].currentValue;
      }
      
      if (changes['journalTargetId']) {
        this.journalTargetId = changes['journalTargetId'].currentValue;
      }
    }
  }
  
  setJournalTarget(): void {
    let selectedId: string = ((this.journalTargetId !== this.itemProxy.item.id) ?
      this.itemProxy.item.id : undefined);
    this.journalTarget.emit(selectedId);
  }
  
  save(): void {
    this.itemProxy.item.description = this.editText;
    this.itemRepository.upsertItem(this.itemProxy.kind, this.itemProxy.item).
      then((proxy: ItemProxy) => {
      this.inEditMode = false;
    });
  }
  
  cancelEditing(): void {
    this.inEditMode = false;
    this.editText = this.itemProxy.item.description;
  }
}