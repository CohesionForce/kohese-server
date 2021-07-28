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
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from '../../material.module'; // deprecated

// Kohese
import { DialogService } from '../../services/dialog/dialog.service';
import { StateMachineEditorComponent } from './state-machine-editor.component';

// Mocks
import { MockDialogService } from '../../../mocks/services/MockDialogService';

describe('Component: state-machine-editor', () => {
  let component: StateMachineEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StateMachineEditorComponent],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatTableModule,
        MaterialModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            stateMachine: {
              state: {
                'stateOne': {
                  name: 'stateOne',
                  description: 'State One Description'
                },
                'stateTwo': {
                  name: 'stateTwo',
                  description: 'State Two Description'
                }
              },
              transition: {
                'transition': {
                  source: 'stateOne',
                  target: 'stateTwo',
                  guard: {}
                }
              }
            },
            defaultState: 'stateOne'
          }
        },
        { provide: DialogService, useClass: MockDialogService },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ]
    }).compileComponents();

    let fixture: ComponentFixture<StateMachineEditorComponent> = TestBed.
      createComponent(StateMachineEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('adds a state', fakeAsync(() => {
    let initialNumberOfStates: number = Object.keys(component.stateMachine.
      state).length;
    component.addState();
    tick();
    expect(Object.keys(component.stateMachine.state).length).toEqual(
      initialNumberOfStates + 1);
  }));

  it('edits a state', fakeAsync(() => {
    component.editState('stateTwo', 'name');
    tick();
    expect(component.stateMachine.state['stateTwo']).not.toBeDefined();
    expect(component.stateMachine.state['Name']).toBeDefined();
    expect(component.stateIds.indexOf('Name')).not.toEqual(-1);
    expect(component.stateMachine.transition['transition'].target).toEqual(
      'Name');
  }));

  it('deletes a state', fakeAsync(() => {
    component.deleteState('stateTwo');
    tick();
    expect(component.stateMachine.state['stateTwo']).not.toBeDefined();
    expect(component.stateMachine.transition['transition']).not.toBeDefined();
  }));

  it('adds a transition', fakeAsync(() => {
    let initialNumberOfTransitions: number = Object.keys(component.
      stateMachine.transition).length;
    component.addTransition('stateTwo', 'stateOne');
    tick();
    expect(Object.keys(component.stateMachine.transition).length).toEqual(
      initialNumberOfTransitions + 1);
    let transition: any = component.stateMachine.transition['Name'];
    expect(transition.source).toEqual('stateTwo');
    expect(transition.target).toEqual('stateOne');
  }));

  it('edits a transition', async () => {
    await component.editTransition('transition', '');
    expect(component.stateMachine.transition['transition']).not.toBeDefined();
    expect(component.stateMachine.transition['Name']).toBeDefined();

    await component.editTransition('Name', 'target');
    expect(component.stateMachine.transition['Name'].target).toEqual(
      'stateOne');
  });

  it('deletes a transition', fakeAsync(() => {
    component.deleteTransition('transition');
    tick();
    expect(component.stateMachine.transition['transition']).not.toBeDefined();
  }));

  it('retrieves the transition ID for source and target state IDs', () => {
    expect(component.getTransitionId('stateOne', 'stateTwo')).toEqual(
      'transition');
    expect(component.getTransitionId('undefinedState', 'stateOne')).not.
      toBeDefined();
  });

  it('sets the default state', () => {
    expect(component.defaultState).toEqual('stateOne');
    component.setDefaultState('stateTwo');
    expect(component.defaultState).toEqual('stateTwo');
  });
});
