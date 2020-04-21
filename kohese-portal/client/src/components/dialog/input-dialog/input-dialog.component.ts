import { Component, ChangeDetectionStrategy, ChangeDetectorRef,
  Input } from '@angular/core';

import { Dialog } from '../Dialog.interface';

export enum InputDialogKind {
  BOOLEAN = 'boolean', NUMBER = 'number', DATE = 'date', TIME = 'time',
    STRING = 'string', MASKED_STRING = 'maskedString', MARKDOWN = 'markdown'
}

interface InputDialogConfiguration {
  title: string;
  text: string;
  fieldName: string;
  value: any;
  validate: (value: any) => boolean;
}

export interface KindInputDialogConfiguration extends
  InputDialogConfiguration {
  inputDialogKind: InputDialogKind;
}

export interface DropdownDialogConfiguration extends InputDialogConfiguration {
  options: Array<any>;
}

@Component({
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputDialogComponent implements Dialog {
  private _inputDialogConfiguration: InputDialogConfiguration;
  get inputDialogConfiguration() {
    return this._inputDialogConfiguration;
  }
  @Input('inputDialogConfiguration')
  set inputDialogConfiguration(inputDialogConfiguration:
    InputDialogConfiguration) {
    this._inputDialogConfiguration = inputDialogConfiguration;
  }
  
  get InputDialogKind() {
    return InputDialogKind;
  }
  
  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }
  
  public isValid(): boolean {
    if (this._inputDialogConfiguration.validate) {
      return this._inputDialogConfiguration.validate(this.
        _inputDialogConfiguration.value);
    } else {
      return true;
    }
  }
  
  public close(accept: boolean): any {
    return (accept ? this._inputDialogConfiguration.value : undefined);
  }
}
