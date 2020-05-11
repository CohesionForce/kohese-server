import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ComponentType } from '@angular/cdk/portal';

import { SimpleDialogComponent } from '../../components/dialog/simple-dialog/simple-dialog.component';
import { InputDialogComponent, InputDialogKind, KindInputDialogConfiguration,
  DropdownDialogConfiguration } from '../../components/dialog/input-dialog/input-dialog.component';
import { ComponentDialogComponent, ComponentDialogConfiguration,
  ButtonLabels } from '../../components/dialog/component-dialog/component-dialog.component';

@Injectable()
export class DialogService {
  public constructor(private dialog: MatDialog) {
  }
  
  public openConfirmDialog(title: string, text: string): Promise<any> {
    return this.openSimpleDialog(title, text, undefined);
  }

  public openYesNoDialog(title: string, text: string): Promise<any> {
    return this.openSimpleDialog(title, text, {
      acceptLabel: 'Yes',
      cancelLabel: 'No'
    });
  }

  public openInformationDialog(title: string, text: string): Promise<any> {
    return this.openSimpleDialog(title, text, { cancelLabel: 'Close' });
  }

  private async openSimpleDialog(title: string, text: string, buttonLabels:
    ButtonLabels): Promise<any> {
    let results: Array<any> = await this.openComponentsDialog([{
      component: SimpleDialogComponent,
      matDialogData: {
        title: title,
        text: text
      }
    }], { data: { buttonLabels: buttonLabels } }).updateSize('40%', 'auto').
      afterClosed().toPromise();
    if (results) {
      return results[0];
    } else {
      return undefined;
    }
  }

  public async openInputDialog(title: string, text: string, inputDialogKind:
    InputDialogKind, fieldName: string, defaultValue: any, validate: (value:
    any) => boolean): Promise<any> {
    let kindInputDialogConfiguration: KindInputDialogConfiguration = {
      title: title,
      text: text,
      fieldName: fieldName,
      value: defaultValue,
      validate: validate,
      inputDialogKind: inputDialogKind
    };
    
    let results: Array<any> = await this.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: kindInputDialogConfiguration
      }
    }], { data: {} }).updateSize('40%', '250px').afterClosed().toPromise(); 
    if (results) {
      return results[0];
    } else {
      return undefined;
    }
  }

  public async openDropdownDialog(title: string, text: string, label: string,
    defaultValue: any, validate: (value: any) => boolean, options: Array<any>):
    Promise<any> {
    if (options.indexOf(defaultValue) === -1) {
      defaultValue = options[0];
    }
    
    let dropdownDialogConfiguration: DropdownDialogConfiguration = {
      title: title,
      text: text,
      fieldName: label,
      value: defaultValue,
      validate: validate,
      options: options
    };
    
    let results: Array<any> = await this.openComponentsDialog([{
      component: InputDialogComponent,
      matDialogData: {
        inputDialogConfiguration: dropdownDialogConfiguration
      }
    }], { data: {} }).updateSize('40%', 'auto').afterClosed().toPromise();
    if (results) {
      return results[0];
    } else {
      return undefined;
    }
  }
  
  public openComponentDialog<T>(component: ComponentType<T>,
    dialogConfiguration: any): MatDialogRef<T> {
    dialogConfiguration.disableClose = true;
    return this.dialog.open(component, dialogConfiguration);
  }

  public openComponentsDialog(componentDialogConfigurations:
    Array<ComponentDialogConfiguration>, dialogConfiguration: any):
    MatDialogRef<ComponentDialogComponent> {
    dialogConfiguration.disableClose = true;
    dialogConfiguration.data.componentDialogConfigurations =
      componentDialogConfigurations;
    return this.dialog.open(ComponentDialogComponent, dialogConfiguration);
  }
}
