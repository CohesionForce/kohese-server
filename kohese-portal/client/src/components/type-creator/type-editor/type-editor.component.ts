import { Input, Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { ItemProxy } from '../../../../../common/models/item-proxy';
import { PropertyEditorComponent } from '../property-editor/property-editor.component';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { TypeProperty } from '../../../classes/UDT/TypeProperty.class';
import { DialogService } from '../../../services/dialog/dialog.service';

@Component({
  selector: 'type-editor',
  templateUrl : './type-editor.component.html',
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
  viewProxy : ItemProxy;
  filteredTypeList : Array<string>
  arbitraryCounter : number;

  /* Form Types */
  selectedTypeForm : FormGroup;

  /* Observables */
  @Input()
  selectedTypeSubject : BehaviorSubject<ItemProxy>;
  filteredTypes : Observable<string[]>;
  saveEmitter : EventEmitter<TypeProperty>;

  /* Subscriptions */
  selectedTypeSubscription : Subscription;
  repoSubscription : Subscription;

  constructor(NavigationService : NavigationService,
              private ItemRepository : ItemRepository,
              private DialogService : DialogService,
              private FormBuilder : FormBuilder) {
    super(NavigationService);
    this.typeList = [];

  }

  ngOnInit () {
    this.repoSubscription = this.ItemRepository.getRepoStatusSubject().subscribe((update) => {
      if (update.connected) {
        this.repoConnected = true;
        let modelProxy : ItemProxy = this.ItemRepository.getProxyFor('Model-Definitions');
        this.typeProxies = modelProxy.getDescendants();
        this.selectedTypeSubject.subscribe((type : object) => {
          if (type) {
            this.selectedType = type;
            this.reset();
          }
        });
        for (let i : number = 0; i < this.typeProxies.length; i++) {
          this.typeList.push(this.typeProxies[i].item.name);
        }
        this.viewProxy = this.ItemRepository.getProxyFor('view-item');
      }
    });

    this.validPropertyTypes = ['string',
    'number',
    'object',
    'boolean',
    'array'];

    this.arbitraryCounter = 0;
    this.saveEmitter = new EventEmitter();
  }

  reset () {
    this.arbitraryCounter = 0;
    this.selectedTypeForm = this.FormBuilder.group({
      name : [this.selectedType.item.name, Validators.required],
      base : [this.selectedType.item.base, Validators.required]
    })

    this.filteredTypes = this.selectedTypeForm.get('base').valueChanges
    .startWith('')
    .map((val : string) => this.filter(val));

  }

  ngOnDestroy () {
    this.repoSubscription.unsubscribe();
    this.selectedTypeSubscription.unsubscribe();
  }

  deleteProperty(property : string) : void {
    delete this.selectedType.item.properties[property];
    // TO-DO also queue up
    console.log(this);
  }

  upsertType() {
    // TO-DO finish impl when save of selected type is possible
    this.viewProxy.modelName = this.selectedType.item.name;
    this.ItemRepository.upsertItem(this.viewProxy);
    // this.ItemRepository.upsertItem(this.selectedType);
  }

  editProperty(property? : TypeProperty) {
    let propertyData = {
      saveEmitter : this.saveEmitter
    };

    if (property) {
      propertyData['property'] = property;
    }

    let dialogReference =
    this.DialogService.openComponentDialog(PropertyEditorComponent,
                                           propertyData);

    this.saveEmitter.subscribe((property) => {
      console.log(property);
      console.log('On Exit emit');
      this.viewProxy.item.viewProperties[property.propertyName] = property;
    })
  }

  filter(val: string): string[] {
    if (!val) {
      val = '';
    }
    return this.typeList.filter((option : string) =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

}

