import { Input, Component, OnInit, OnDestroy, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'editable-cell',
  templateUrl: './editable-cell.component.html'
}) 
export class EditableCellComponent implements OnInit, OnDestroy, OnChanges{
  @Input() 
  column : string;
  @Input()
  action : any;
  @Input()
  editableStream : Observable<boolean>;
  editableStreamSub : Subscription;
  editable : boolean = false;
  editableField : boolean = false;

  initialized : boolean = false;

  constructor(){

  }

  ngOnInit () {
    this.editableStreamSub = this.editableStream.subscribe((editable)=>{
      this.editable = editable;
    })
    
    this.initialized = true;
    if (this.action.proxy.model.item.name === 'Task' ||
        this.action.proxy.model.item.name === 'Action') {
      this.editableField = true;
    }
  }

  ngOnDestroy () {
    this.editableStreamSub.unsubscribe();
  }

  ngOnChanges (changes : SimpleChanges) {
      if (this.initialized) {
  
        if(changes['action']) {
          this.action = changes['action'].currentValue;
          if(this.action.proxy.model.item.name === 'Task' ||
             this.action.proxy.model.item.name === 'Action') {
               this.editableField = true;
             } else {
               this.editableField = false;
             }
        }
      }
    }
  }