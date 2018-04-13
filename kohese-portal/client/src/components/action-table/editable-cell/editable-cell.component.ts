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
  @Input() 
  rowActionStream : Observable<any>;
  rowActionStreamSub : Subscription;
  editableStreamSub : Subscription;
  editable : boolean = false;
  editableField : boolean = false;

  initialized : boolean = false;

  constructor(){

  }

  ngOnInit () {
    if (this.action.proxy.model.internal) {
      this.editableField = false;
    } else {
      this.editableStreamSub = this.editableStream.subscribe((editable)=>{
        if (!editable) {
          this.editable = false;
        }
      })
      
      this.initialized = true;
      if (this.action.proxy.model.item.name === 'Task' ||
          this.action.proxy.model.item.name === 'Action') {
        this.editableField = true;
      }
      this.rowActionStreamSub = this.rowActionStream.subscribe(rowAction => {
        if (rowAction.rowProxy.item.id === this.action.proxy.item.id ) {
          if (rowAction.type === 'Edit')  {
            this.editable = !this.editable
          } else if (rowAction.type === 'Save') {
            this.editable = false;
          }
        }
      })
    }
  }

  ngOnDestroy () {
    this.editableStreamSub.unsubscribe();
    this.rowActionStreamSub.unsubscribe();
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