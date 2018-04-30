import { Component, Input, OnInit } from '@angular/core';
import { ReferenceTableInfo } from '../references-tab.component';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';

@Component({
  selector : 'reference-table',
  templateUrl : './reference-table.component.html',
  styleUrls : ['../references-tab.component.scss'] 
})
export class ReferenceTableComponent extends NavigatableComponent implements OnInit {
  /* Data */
  @Input() 
  referencesInfo : Array<ReferenceTableInfo>
  @Input()
  routingStrategy : string;
  rowDef : Array<string> = ['kind','name','state','description'];


  constructor(private navigationService : NavigationService) {
    super(navigationService);
  }

  ngOnInit () {

    console.log(this);
  }

  customNavigation (location, params) {
    if (this.routingStrategy === 'tab') {
      super.addTab(location, params)
      console.log('Add tab');
    } else {
      super.navigate(location, params)
    }
  }

}