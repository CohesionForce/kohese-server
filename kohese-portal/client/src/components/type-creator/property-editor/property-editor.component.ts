import { Input, Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class'
import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';

import { TypeProperty } from '../../../classes/UDT/TypeProperty.class';

@Component({
  templateUrl : './property-editor.component.html',
  selector : 'property-editor'
})
export class PropertyEditorComponent extends NavigatableComponent
                                     implements OnInit, OnDestroy  {
  /* Data */
  @Input()
  property : TypeProperty;
  /* UI Switches */
  onExit : EventEmitter<TypeProperty>
  /* Subscriptions */

  /* Observables */

  constructor (protected NavigationService : NavigationService,
               protected TabService : TabService) {
    super(NavigationService, TabService)
  }

  ngOnInit () {
    this.onExit = new EventEmitter();
    if(!this.property) {
      this.property = {
        type : 'text',
        template : '',
        required : false,
        default : '',
        propertyName : '',
        enum : undefined
      }
    }
    console.log(this);
  }

  ngOnDestroy () {
    this.onExit.emit(this.property);
  }

  renderHtml() {

  }
}
