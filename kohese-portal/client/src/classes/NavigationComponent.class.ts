import { Injectable } from '@angular/core';

import { NavigationService } from '../services/navigation/navigation.service';

@Injectable()
export class NavigatableComponent {
  constructor(protected NavigationService: NavigationService) {
  }

  navigate (location : string, params: object) {
    this.NavigationService.navigate(location, params);
  }
}
