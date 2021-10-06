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
import { TestBed } from '@angular/core/testing';

// Kohese
import { Filter, FilterCriteriaConnection, FilterCriteriaConnectionType, FilterCriterion } from './filter.class';

class EvaluationObject {
  private _numericProperty: number = 3;
  private _stringProperty: string = 'String Property';

  public constructor() {
  }
}

let evaluationObject: any = new EvaluationObject();

describe('Class: Filter', () => {
  let filter: Filter;

  beforeEach(() => {
    filter = new Filter();
    let connection: FilterCriteriaConnection = new FilterCriteriaConnection(
      FilterCriteriaConnectionType.OR);
    connection.criteria.push(new FilterCriterion(filter.filterableProperties[
      0], FilterCriterion.CONDITIONS.EQUALS, 'string property'));
    let orFilterCriterion: FilterCriterion =
      new FilterCriterion(filter.filterableProperties[0], FilterCriterion.
      CONDITIONS.CONTAINS, 'value');
    orFilterCriterion.negate = true;
    connection.criteria.push(orFilterCriterion);
    filter.rootElement.connections.push(connection);
    filter.rootElement.criteria.push(new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.LESS_THAN, '3'));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('filters based on criteria', () => {
    let results: Array<any> = filter.filter([evaluationObject]);
    expect(results.indexOf(evaluationObject)).toEqual(-1);
    filter.rootElement.criteria[0].negate = true;
    results = filter.filter([evaluationObject]);
    expect(results.indexOf(evaluationObject)).not.toEqual(-1);
  });

  it('removes FilterElements', () => {
    expect(filter.removeElement(filter.rootElement.connections[0].criteria[
      0])).toEqual(true);
    expect(filter.removeElement(filter.rootElement.connections[0])).toEqual(
      true);
    expect(filter.removeElement(new FilterCriteriaConnection(
      FilterCriteriaConnectionType.AND))).toEqual(false);
  });
});

describe('Class: FilterCriterion', () => {
  let filter: Filter = new Filter();

  it('evaluates whether a property value is < a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.LESS_THAN, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
    criterion.value = '7';
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
  });

  it('evaluates whether a property value is <= to a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.
      LESS_THAN_OR_EQUAL_TO, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '1';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value equals a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.EQUALS, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '7';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value contains a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.CONTAINS, 'String');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'value';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value matches a regular expression', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.
      MATCHES_REGULAR_EXPRESSION, '/prop/i');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '/prop/';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value ends with a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.ENDS_WITH,
      'Property');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'value';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value begins with a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.BEGINS_WITH,
      'String');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'value';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value is >= a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.
      GREATER_THAN_OR_EQUAL_TO, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '7';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });

  it('evaluates whether a property value is > a value', () => {
    let criterion: FilterCriterion = new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.GREATER_THAN, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
    criterion.value = '1';
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
  });
});
