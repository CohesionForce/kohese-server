/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, Optional, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

// Other External Dependencies

// Kohese
import { DialogService } from '../../services/dialog/dialog.service';
import { InputDialogKind } from '../dialog/input-dialog/input-dialog.component';

@Component({
  selector: 'state-machine-editor',
  templateUrl: './state-machine-editor.component.html',
  styleUrls: ['./state-machine-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StateMachineEditorComponent implements OnInit {
  get data() {
    return this._data;
  }

  private _stateMachine: any;
  get stateMachine() {
    return this._stateMachine;
  }

  private _defaultState: string;
  get defaultState() {
    return this._defaultState;
  }

  private _stateIds: Array<string>;
  get stateIds() {
    return this._stateIds;
  }

  private _tableDataSource: MatTableDataSource<string>;
  get tableDataSource() {
    return this._tableDataSource;
  }

  public readonly LEFTMOST_COLUMN_ID: string = 'toState';
  get columns() {
    let columns: Array<string> = Object.keys(this._stateMachine.state);
    columns.splice(0, 0, this.LEFTMOST_COLUMN_ID);
    return columns;
  }

  private _modified: boolean = false;

  public constructor(@Optional() @Inject(MAT_DIALOG_DATA) private _data: any,
    private _dialogService: DialogService, private _changeDetectorRef:
    ChangeDetectorRef, private _matDialogRef:
    MatDialogRef<StateMachineEditorComponent>) {
  }

  public ngOnInit(): void {
    this._stateMachine = this._data['stateMachine'];
    this._defaultState = this._data['defaultState'];
    this._stateIds = Object.keys(this._stateMachine.state);
    this._tableDataSource = new MatTableDataSource<string>(this._stateIds);
  }

  public async addState(): Promise<void> {
    let name: any = await this._dialogService.openInputDialog('Add State', '',
      InputDialogKind.STRING, 'Name', '', undefined);
    if (name) {
      this._stateMachine.state[name] = {
        name: name,
        description: ''
      };
      this._stateIds.push(name);

      this._modified = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public async editState(stateId: string, propertyId: string): Promise<void> {
    let propertyName: string = propertyId.charAt(0).toUpperCase() +
      propertyId.slice(1);

    let value: any = await this._dialogService.openInputDialog('Edit ' +
      propertyName, '', InputDialogKind.STRING, propertyName, this._stateMachine.
      state[stateId][propertyId], undefined);
    if (value) {
      this._stateMachine.state[stateId][propertyId] = value;
      if ('name' === propertyId) {
        this._stateMachine.state[value] = this._stateMachine.state[stateId];
        delete this._stateMachine.state[stateId];
        this._stateIds.splice(this._stateIds.indexOf(stateId), 1);
        this._stateIds.push(value);
        for (let transitionId in this._stateMachine.transition) {
          let transition: any = this._stateMachine.transition[transitionId];
          if (stateId === transition.source) {
            transition.source = value;
          }

          if (stateId === transition.target) {
            transition.target = value;
          }
        }
      }

      this._modified = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public async deleteState(stateId: string): Promise<void> {
    let affectedTransitionIds: Array<string> = [];
    let message: string = 'The following transitions are also to be deleted: ';
    for (let transitionId in this._stateMachine.transition) {
      let transition: any = this._stateMachine.transition[transitionId];
      if ((stateId === transition.source) || (stateId === transition.
        target)) {
        affectedTransitionIds.push(transitionId);
        message += (transitionId + ', ');
      }
    }

    if (affectedTransitionIds.length > 0) {
      message = message.substring(0, message.lastIndexOf(', ')) + '. ';
    } else {
      message = '';
    }

    message += ('Are you sure that you want to delete ' + stateId + '?');

    let shouldDelete: any = await this._dialogService.openYesNoDialog(
      'Delete ' + stateId, message);
    if (shouldDelete) {
      delete this._stateMachine.state[stateId];
      this._stateIds.splice(this._stateIds.indexOf(stateId), 1);
      for (let j: number = 0; j < affectedTransitionIds.length; j++) {
        delete this._stateMachine.transition[affectedTransitionIds[j]];
      }

      this._modified = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public async addTransition(sourceStateId: string, targetStateId: string):
    Promise<void> {
    let name: any = await this._dialogService.openInputDialog('Add Transition',
      '', InputDialogKind.STRING, 'Name', '', undefined);
    if (name) {
      this._stateMachine.transition[name] = {
        source: sourceStateId,
        target: targetStateId,
        guard: {}
      };

      this._modified = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public async editTransition(transitionId: string, propertyId: string):
    Promise<void> {
    if (propertyId) {
      let propertyName: string = propertyId.charAt(0).toUpperCase() +
        propertyId.slice(1);
      let options: { [optionName: string]: string } = {};
      for (let j: number = 0; j < this._stateIds.length; j++) {
        options[this._stateIds[j]] = this._stateIds[j];
      }

      let value: any = await this._dialogService.openDropdownDialog('Edit ' +
        propertyName, '', propertyName, this._stateMachine.transition[
        transitionId][propertyId], undefined, options);
      if (value) {
        this._stateMachine.transition[transitionId][propertyId] = value;

        this._modified = true;
        this._changeDetectorRef.markForCheck();
      }
    } else {
      let value: any = await this._dialogService.openInputDialog('Edit Name',
        '', InputDialogKind.STRING, 'Name', transitionId, undefined);
      if (value) {
        this._stateMachine.transition[value] = this._stateMachine.transition[
            transitionId];
        delete this._stateMachine.transition[transitionId];

        this._modified = true;
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  public async deleteTransition(transitionId: string): Promise<void> {
    let shouldDelete: any = await this._dialogService.openYesNoDialog(
      'Delete ' + transitionId, 'Are you sure that you want to delete ' +
      transitionId + '?');
    if (shouldDelete) {
      delete this._stateMachine.transition[transitionId];

      this._modified = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public getTransitionId(fromStateId: string, toStateId: string): string {
    for (let transitionId in this._stateMachine.transition) {
      if ((fromStateId === this._stateMachine.transition[transitionId].
        source) && (toStateId === this._stateMachine.transition[transitionId].
        target)) {
        return transitionId;
      }
    }

    return undefined;
  }

  public setDefaultState(stateId: string): void {
    this._defaultState = stateId;

    this._modified = true;
    this._changeDetectorRef.markForCheck();
  }

  public async cancelSelected(): Promise<void> {
    if (this._modified) {
      let selection: any = await this._dialogService.openYesNoDialog(
        'Unapplied Changes', 'All changes in this dialog will be lost. Do ' +
        'you want to proceed?');
      if (!selection) {
        return Promise.resolve();
      }
    }

    this._matDialogRef.close();
  }
}
