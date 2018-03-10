import { Component, Input, OnInit, Output, EventEmitter,
  OnChanges, SimpleChanges } from '@angular/core';
import { UserInput } from '../user-input.class';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { StateService } from '../../../services/state/state.service';
import { KoheseType } from '../../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';

@Component({
  selector: 'k-state-editor',
  templateUrl: './k-state-editor.component.html',
  styleUrls: ['./k-state-editor.component.scss']
})
export class KStateEditorComponent extends UserInput implements OnInit,
  OnChanges {
  @Input()
  public itemProxy: ItemProxy;
  @Input()
  public disableTransitioning: boolean;
  
  private _koheseType: KoheseType;
  get koheseType() {
    return this._koheseType;
  }
  private _transitionCandidates: Array<any>;
  get transitionCandidates() {
    return this._transitionCandidates;
  }
  private _transitionCandidateFieldNames: Array<string>;
  get transitionCandidateFieldNames() {
    return this._transitionCandidateFieldNames;
  }
  
  private _initialized: boolean = false;
  
  @Output()
  public stateChanged: EventEmitter<any> = new EventEmitter<any>();
  
  public constructor(private _stateService: StateService,
    private _typeService: DynamicTypesService,
    private _itemRepository: ItemRepository) {
    super();
  }
  
  public ngOnInit(): void {
    this._koheseType = this._typeService.getKoheseTypes()[this.itemProxy.kind];
    this._transitionCandidates = this._stateService.
      getTransitionCandidates(this.itemProxy);
    this._transitionCandidateFieldNames = Object.keys(this.
      _transitionCandidates);
      
    this._initialized = true;
  }
  
  public ngOnChanges(changes: SimpleChanges): void {
    if (this._initialized) {
      if (changes['itemProxy']) {
        this.itemProxy = changes['itemProxy'].currentValue;
        this.ngOnInit();
      }
      
      if (changes['disableTransitioning']) {
        this.disableTransitioning = changes['disableTransitioning'].
          currentValue;
      }
    }
  }
  
  public openTransitionDialog(fieldName: string, candidate: string): void {
    //this.dialogService.openComponentDialog().afterClosed().subscribe(() => {
      this.stateChanged.emit({
        fieldName: fieldName,
        candidate: candidate
      });
      this.itemProxy.item[fieldName] = candidate;
      this._transitionCandidates = this._stateService.
        getTransitionCandidates(this.itemProxy);
      this._transitionCandidateFieldNames = Object.keys(this.
        _transitionCandidates);
    //});
  }
}
