import { NavigatableComponent } from "../../../classes/NavigationComponent.class";
import { NavigationService } from "../../../services/navigation/navigation.service";
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import * as ItemProxy from '../../../../../common/src/item-proxy';

export class AssignmentCard extends NavigatableComponent {

  editable : boolean; 
  editedProxy : ItemProxy 

  constructor (private navigationService : NavigationService ,
               private itemRepository : ItemRepository) {
    super (navigationService);
  }

  toggleEdit (editable : boolean ) {
    this.editable = !editable
    console.log('toggle')
  }

  stateChanged(a, b) {
    console.log(a);
    console.log(b);
  }

  upsertItem() {
    
  }
}