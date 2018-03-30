import { Component, Input, OnInit } from '@angular/core';
import { ReferenceTableInfo } from '../references-tab.component';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { NavigatableComponent } from '../../../../classes/NavigationComponent.class';

@Component({
  selector : 'reference-table',
  templateUrl : './reference-table.component.html',
  styleUrls : ['../references-tab.component.scss'] 
})
export class ReferenceTableComponent extends NavigatableComponent {
  /* Data */
  @Input() 
  referencesInfo : Array<ReferenceTableInfo>
  rowDef : Array<string> = ['kind','name','state','description'];


  constructor(private navigationService : NavigationService) {
    super(navigationService);
  }

}