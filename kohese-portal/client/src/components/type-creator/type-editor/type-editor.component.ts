import { Input, Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

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
  baseControl : FormControl = new FormControl();

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
              private DialogService : DialogService) {
    super(NavigationService);
    this.typeList = [];

  }

  ngOnInit () {
    this.repoSubscription = this.ItemRepository.getRepoStatusSubject().subscribe((update) => {
      if (update.connected) {
        this.repoConnected = true;
        let modelProxy : ItemProxy = this.ItemRepository.getProxyFor('Model-Definitions');
        this.typeProxies = modelProxy.getDescendants();
        for (let i : number = 0; i < this.typeProxies.length; i++) {
          this.typeList.push(this.typeProxies[i].item.name);
        }
        this.viewProxy = this.ItemRepository.getProxyFor('view-item');
      }
    });
    this.selectedTypeSubject.subscribe((type : object) => {
      this.selectedType = type;
      this.reset();
    });

    this.filteredTypes = this.baseControl.valueChanges
      .startWith('')
      .map((val : string) => this.filter(val));

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
    this.ItemRepository.upsertItem(this.viewProxy);
    this.ItemRepository.upsertItem(this.selectedType);
  }

  addProperty() {
    let propertyData = {
      saveEmitter : this.saveEmitter
    };
    let dialogReference =
      this.DialogService.openComponentDialog(PropertyEditorComponent,
                                             propertyData);
    this.saveEmitter.subscribe((property) => {
      console.log(property);
      console.log('On Exit emit');
      this.viewProxy.item.viewProperties[property.propertyName] = property;
    })
    console.log(dialogReference);
  }

  editProperty(property : TypeProperty) {
    let propertyData = {
      property : property
    };
    let dialogReference =
    this.DialogService.openComponentDialog(PropertyEditorComponent,
                                           propertyData);
  }

  filter(val: string): string[] {
    if (!val) {
      val = '';
    }
    return this.typeList.filter((option : string) =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

//   createFormGroup () : FormGroup {
//     let formObject = {
//       name : this.selectedType.name,
//       base : t
//     };
//     for (let i : number = 0; i < this.currentType.properties.length; i ++ ) {
//       let currentProperty = this.currentType.properties[i]
//       if (currentProperty.required) {
//         formObject[currentProperty.propertyName] = [currentProperty.default, Validators.required]
//       } else {
//         formObject[currentProperty.propertyName] = currentProperty.default;
//       }
//     }
//     const group = this.FormBuilder.group(formObject);
//     //this.config.forEach(control => group.addControl(control.name, this.FormBuilder.control()));
//     return group;
// }
}

