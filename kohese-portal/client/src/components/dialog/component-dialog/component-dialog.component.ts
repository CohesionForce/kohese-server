import { Directive, Input, ViewContainerRef, Component,
  ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit, Inject,
  ViewChildren, QueryList, ComponentFactoryResolver } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface ComponentDialogConfiguration {
  component: ComponentType<any>;
  matDialogData: any;
  // Optional to accommodate case where no label is displayed
  label?: string;
}

export interface ButtonLabels {
  // Optional to allow for a default value of 'Accept'
  acceptLabel?: string;
  cancelLabel: string;
}

@Directive({
  selector: '[dynamic-component]'
})
export class DynamicComponentDirective {
  get viewContainerRef() {
    return this._viewContainerRef;
  }
  
  public constructor(private _viewContainerRef: ViewContainerRef) {
  }
}

@Component({
  templateUrl: './component-dialog.component.html',
  styleUrls: ['./component-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentDialogComponent implements OnInit, AfterViewInit {
  private _title: string;
  get title() {
    return this._title;
  }
  
  private _configurationInstanceMap: Map<ComponentDialogConfiguration, any> =
    new Map<ComponentDialogConfiguration, any>();
  get configurationInstanceMap() {
    return this._configurationInstanceMap;
  }
  
  @ViewChildren(DynamicComponentDirective)
  private _dynamicComponentDirectiveQueryList:
    QueryList<DynamicComponentDirective>;
  
  private _values: Array<any> = [];
  get values() {
    return this._values;
  }
  
  private _buttonLabels: ButtonLabels;
  get buttonLabels() {
    return this._buttonLabels;
  }
  
  get matDialogRef() {
    return this._matDialogRef;
  }
  
  get Array() {
    return Array;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private _matDialogData: any,
    private _matDialogRef: MatDialogRef<ComponentDialogComponent>,
    private _componentFactoryResolver: ComponentFactoryResolver) {
  }
  
  public ngOnInit(): void {
    this._title = this._matDialogData['title'];

    let componentDialogConfigurations: Array<ComponentDialogConfiguration> =
      (<Array<ComponentDialogConfiguration>> this._matDialogData[
      'componentDialogConfigurations']);
    /* Populate the keys of configurationInstanceMap now since the template
    depends on those keys being set */
    for (let j: number = 0; j < componentDialogConfigurations.length; j++) {
      this._configurationInstanceMap.set(componentDialogConfigurations[j],
        undefined);
    }
    
    this._buttonLabels = this._matDialogData['buttonLabels'];
  }
  
  public ngAfterViewInit(): void {
    let dynamicComponentDirectives: Array<DynamicComponentDirective> = this.
      _dynamicComponentDirectiveQueryList.toArray();
    let componentDialogConfigurations: Array<ComponentDialogConfiguration> =
      Array.from(this._configurationInstanceMap.keys());
    for (let j: number = 0; j < dynamicComponentDirectives.length; j++) {
      let instance: any = dynamicComponentDirectives[j].viewContainerRef.
        createComponent(this._componentFactoryResolver.resolveComponentFactory(
        componentDialogConfigurations[j].component)).instance;
      // Populate '@Input'-decorated attributes
      for (let attributeName in componentDialogConfigurations[j].
        component['__prop__metadata__']) {
        let value: any = componentDialogConfigurations[j].matDialogData[
          attributeName];
        if (value != null) {
          instance[attributeName] = value;
        }
      }
      
      this._configurationInstanceMap.set(componentDialogConfigurations[j],
        instance);
    }
    
    /* Use setTimeout to trigger change detection for dialog components and
    not produce an error in development mode */
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 0);
    
    this._values.length = dynamicComponentDirectives.length;
  }
  
  public areAllComponentsValid(): boolean {
    let isValid: boolean = true;
    let instances: Array<any> = Array.from(this._configurationInstanceMap.
      values());
    for (let j: number = 0; j < instances.length; j++) {
      if (!instances[j].isValid()) {
        isValid = false;
        break;
      }
    }
    
    return isValid;
  }
}
