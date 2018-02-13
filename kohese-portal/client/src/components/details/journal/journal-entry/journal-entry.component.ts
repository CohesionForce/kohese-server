import { Component, Input, Output, EventEmitter, OnInit, OnChanges,
  SimpleChanges } from '@angular/core';
import { SessionService } from '../../../../services/user/session.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../../common/models/item-proxy';

@Component({
  selector: 'journal-entry',
  templateUrl: './journal-entry.component.html'
})
export class JournalEntryComponent implements OnInit, OnChanges {
  @Input()
  public input: ItemProxy;
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
    this.editText = this.input.item.description;
    this.initialized = true;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {
      if (changes['input']) {
        this.input = changes['input'].currentValue;
      }
      
      if (changes['journalTargetId']) {
        this.journalTargetId = changes['journalTargetId'].currentValue;
      }
    }
  }
  
  setJournalTarget(): void {
    let selectedId: string = ((this.journalTargetId !== this.input.item.id) ?
      this.input.item.id : undefined);
    this.journalTarget.emit(selectedId);
  }
  
  save(): void {
    this.input.item.description = this.editText;
    this.itemRepository.upsertItem(this.input).then((proxy: ItemProxy) => {
      this.inEditMode = false;
    });
  }
  
  cancelEditing(): void {
    this.inEditMode = false;
    this.editText = this.input.item.description;
  }
}