import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms'

import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { ItemProxy } from '../../../../../common/models/item-proxy'

import { NavigationService } from '../../../services/navigation/navigation.service';
import { TabService } from '../../../services/tab/tab.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';


@Component({
  selector: 'type-editor',
  templateUrl : './type-editor.component.html'
})

export class TypeEditorComponent extends NavigatableComponent
                                  implements OnInit, OnDestroy {

  /* UI Switches */
  repoConnected : boolean;
  /* Data */
  selectedType : ItemProxy;
  validPropertyTypes : Array<string>
  typeProxies : Array<ItemProxy>
  typeList : Array<string>;
  filteredTypeList : Array<string>
  arbitraryCounter : number;

  /* Form Types */
  baseControl : FormControl = new FormControl();

  /* Observables */
  @Input()
  selectedTypeSubject : BehaviorSubject<ItemProxy>;
  filteredTypes : Observable<string[]>;

  /* Subscriptions */
  selectedTypeSubscription : Subscription;
  repoSubscription : Subscription;

  constructor(NavigationService : NavigationService,
              TabService : TabService,
              private ItemRepository : ItemRepository) {
    super(NavigationService, TabService);
    this.typeList = [];

  }

  ngOnInit () {
    this.repoSubscription = this.ItemRepository.getRepoStatusSubject().subscribe((update) => {
      if (update.connected) {
        this.repoConnected = true;
        let modelProxy = this.ItemRepository.getProxyFor('Model-Definitions');
        this.typeProxies = modelProxy.getDescendants();
        for (var i = 0; i < this.typeProxies.length; i++) {
          this.typeList.push(this.typeProxies[i].item.name);
        }
      }
    });
    this.selectedTypeSubject.subscribe((type) => {
      this.selectedType = type;
      this.reset();
    });

    this.filteredTypes = this.baseControl.valueChanges
      .startWith('')
      .map(val => this.filter(val));

    this.validPropertyTypes = ['string',
    'number',
    'object',
    'boolean',
    'array']

    this.arbitraryCounter = 0;
  }

  reset () {
    this.arbitraryCounter = 0;
  }

  ngOnDestroy () {
    this.repoSubscription.unsubscribe();
    this.selectedTypeSubscription.unsubscribe();
  }

  deleteProperty(property) : void {
    delete this.selectedType.item.properties[property];
    console.log(this);
  }

  upsertType() {
    this.ItemRepository.upsertItem(this.selectedType);
  }

  addProperty() {
    let newPropKey = 'newProperty' + ++this.arbitraryCounter;
    this.selectedType.item.properties[newPropKey] = {
      type : 'string',
      required : false
      }
    }

  filter(val: string): string[] {
    if (!val) {
      val = '';
    }
    return this.typeList.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }
}


