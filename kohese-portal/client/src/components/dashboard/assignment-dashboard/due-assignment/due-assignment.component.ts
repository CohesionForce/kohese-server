import { Component, Input } from '@angular/core'
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import {NavigatableComponent} from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';

@Component({
  selector : 'due-assignment',
  templateUrl: 'due-assignment.component.html',
  styleUrls : ['due-assignment.component.scss']
})
export class DueAssignmentComponent extends NavigatableComponent {

  /* Data */
  @Input() 
  assignment : ItemProxy 

  constructor (private navigationService : NavigationService) {
    super (navigationService);
  }

  stateChanged(a, b) {
    console.log(a);
    console.log(b);
  }
}