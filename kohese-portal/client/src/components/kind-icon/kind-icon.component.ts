import { Component, Input } from '@angular/core';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';

@Component({
  selector: 'kind-icon',
  templateUrl : './kind-icon.component.html'
})
export class KindIconComponent {
  @Input()
  kind : string;
  public koheseType: any;

  constructor(private typeService: DynamicTypesService) {
  }
  
  ngOnInit(): void {
    this.koheseType = this.typeService.getKoheseTypes()[this.kind];
    if (!this.koheseType) {
      this.koheseType = {
        name: this.kind,
        icon: 'fa fa-sticky-note'
      };
    }
  }
}
