import { Component, Input } from '@angular/core'
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import {NavigatableComponent} from '../../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../../services/navigation/navigation.service';

@Component({
  selector : 'completed-assignment',
  templateUrl: 'completed-assignment.component.html',
  styleUrls : ['completed-assignment.component.scss']
})
export class CompletedAssignmentComponent extends NavigatableComponent {

  /* Data */
  @Input() 
  assignment : ItemProxy 

  constructor (private navigationService : NavigationService) {
    super (navigationService);
  }
}