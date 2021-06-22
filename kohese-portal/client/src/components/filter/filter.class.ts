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


export enum ValueInputType {
  STRING, NUMBER, SELECT
}

export class FilterableProperty {
  public static readonly PROPERTIES: string = '<PROPERTIES>';

  public constructor(public displayText: string, public propertyPath:
    Array<string>, public valueInputType: ValueInputType, public values:
    Array<string>) {
  }
}

export class Filter {
  private _rootElement: FilterCriteriaConnection =
    new FilterCriteriaConnection(FilterCriteriaConnectionType.AND);
  get rootElement() {
    return this._rootElement;
  }

  private _filterableProperties: Array<FilterableProperty> = [];
  get filterableProperties() {
    return this._filterableProperties;
  }

  public constructor() {
    this._filterableProperties.push(new FilterableProperty('Any property', [],
      ValueInputType.STRING, []));
  }

  public filter(objects: Array<any>): Array<any> {
    let matchingObjects: Array<any> = [];
    for (let j: number = 0; j < objects.length; j++) {
      let object: any = objects[j];
      if (this.evaluateConnection(this._rootElement, object)) {
        matchingObjects.push(object);
      }
    }

    return matchingObjects;
  }

  public isElementPresent(element: FilterElement): boolean {
    let connectionStack: Array<FilterCriteriaConnection> = [this._rootElement];
    while (connectionStack.length > 0) {
      let connection: FilterCriteriaConnection = connectionStack.pop();
      if (element instanceof FilterCriterion) {
        for (let j: number = 0; j < connection.criteria.length; j++) {
          if (element === connection.criteria[j]) {
            return true;
          }
        }
      } else {
        for (let j: number = 0; j < connection.connections.length; j++) {
          if (element === connection.connections[j]) {
            return true;
          } else {
            connectionStack.push(connection.connections[j]);
          }
        }
      }
    }

    return false;
  }

  public removeElement(element: FilterElement): boolean {
    let removed: boolean = false;
    let connectionStack: Array<FilterCriteriaConnection> = [this._rootElement];
    searchLoop: while (connectionStack.length > 0) {
      let connection: FilterCriteriaConnection = connectionStack.pop();
      if (element instanceof FilterCriterion) {
        for (let j: number = 0; j < connection.criteria.length; j++) {
          if (element === connection.criteria[j]) {
            connection.criteria.splice(j, 1);
            removed = true;
            break searchLoop;
          }
        }
      } else {
        for (let j: number = 0; j < connection.connections.length; j++) {
          if (element === connection.connections[j]) {
            connection.connections.splice(j, 1);
            removed = true;
            break searchLoop;
          }
        }
      }

      connectionStack.push(...connection.connections);
    }

    return removed;
  }

  private evaluateConnection(connection: FilterCriteriaConnection, object:
    any): boolean {
    for (let j: number = 0; j < connection.criteria.length; j++) {
      if (connection.criteria[j].evaluate(object)) {
        if (FilterCriteriaConnectionType.OR === connection.type) {
          return true;
        }
      } else if (FilterCriteriaConnectionType.AND === connection.type) {
        return false;
      }
    }

    for (let j: number = 0; j < connection.connections.length; j++) {
      let connectionMatches: boolean = this.evaluateConnection(connection.
        connections[j], object);
      if (connectionMatches) {
        if (FilterCriteriaConnectionType.OR === connection.type) {
          return true;
        }
      } else if (FilterCriteriaConnectionType.AND === connection.type) {
        return false;
      }
    }

    if (FilterCriteriaConnectionType.AND === connection.type){
      // Return true because none of the "AND" cases failed
      return true;
    } else {
      // Return false because none of the "OR" cases passed
      return false;
    }
  }
}

export class FilterElement {
  protected constructor() {
  }
}

enum FilterCriterionCondition {
  LESS_THAN = '<', LESS_THAN_OR_EQUAL_TO = '<=', EQUALS = 'equals',
  CONTAINS = 'contains', MATCHES_REGULAR_EXPRESSION = 'matches regular expression',
  ENDS_WITH = 'ends with', BEGINS_WITH = 'begins with',
  GREATER_THAN_OR_EQUAL_TO = '>=', GREATER_THAN = '>',
  IS_EMPTY = 'is empty', IS_MISSING = 'is missing', IS_EMPTY_OR_MISSING = 'is empty or missing'
}

export class FilterCriterion extends FilterElement {
  public static readonly CONDITIONS: any = FilterCriterionCondition;

  get property() {
    return this._property;
  }
  set property(property: FilterableProperty) {
    this._property = property;
  }

  get condition() {
    return this._condition;
  }
  set condition(condition: any) {
    this._condition = condition;
  }

  get value() {
    return this._value;
  }
  set value(value: string) {
    this._value = value;
    this.convertValueToRegularExpression();
  }

  isValueShown(): Boolean {
    switch (this._condition) {
      case FilterCriterionCondition.IS_EMPTY:
      case FilterCriterionCondition.IS_MISSING:
      case FilterCriterionCondition.IS_EMPTY_OR_MISSING:
        return false;
        break;
      default:
        return true;

    }
  }

  private _negate: boolean = false;
  get negate() {
    return this._negate;
  }
  set negate(negate: boolean) {
    this._negate = negate;
  }

  private _ignoreCase: boolean = true;
  get ignoreCase() {
    return this._ignoreCase;
  }
  set ignoreCase(ignoreCase: boolean) {
    this._ignoreCase = ignoreCase;
    this.convertValueToRegularExpression();
  }

  private _external: boolean = false;
  get external() {
    return this._external;
  }
  set external(external: boolean) {
    this._external = external;
  }

  protected matcher: RegExp;

  public constructor(private _property: FilterableProperty, private _condition:
    FilterCriterionCondition, private _value: string) {
    super();
    this.convertValueToRegularExpression();
  }

  private convertValueToRegularExpression(): void {
    let filterIsRegex: Array<string> = this._value.match(new RegExp(
      '^\/(.*)\/([gimy]*)$'));
    if (filterIsRegex) {
      this.matcher = new RegExp(filterIsRegex[1], filterIsRegex[2]);
    } else {
      let flags: string = '';
      if (this._ignoreCase) {
        flags += 'i';
      }

      this.matcher = new RegExp(this._value, flags);
    }
  }

  public evaluate(candidate: any, nested: boolean = false): boolean {
    let result: boolean = false;
    if (!nested && this._property.propertyPath.length > 0) {
      // Evaluate the specified property path
      let propertyPath: Array<string> = this._property.propertyPath.slice(0);
      let property: any = candidate;
      for (let j: number = 0; j < propertyPath.length - 1; j++) {
        property = property[propertyPath[j]];
      }

      let lastPropertyPathSegment: string = propertyPath[propertyPath.length - 1];
      let validMatchingPropertiesIndex = Object.keys(property).indexOf(this.value);
      if (lastPropertyPathSegment === FilterableProperty.PROPERTIES) {
        result = (-1 !== validMatchingPropertiesIndex);
      } else {
        result = this.evaluateAProperty(property, lastPropertyPathSegment)
      }
    } else {
      // Evaluate any properties
      for (let propertyName in candidate) {
        result = this.evaluateAProperty(candidate, propertyName);
        if (result) {
          break;
        }
      }
    }

    if (!nested && this._negate) {
      result = !result;
    }

    return result;
  }

  private evaluateAProperty(candidate, propertyName): boolean {
    let result: boolean = false;
    let propertyValue = candidate[propertyName];
    if (typeof propertyValue === 'object') {
      // propertyValue is an object or an array
      if (propertyValue && Object.keys(propertyValue).length) {
        // Evaluate if the object has nested properties (recursive)
        result = this.evaluate(propertyValue, true);
      } else {
        // Object does not have nested properties
        result = false;
      }
    } else {
      // propertyValue is a simple value
      result = this.doesValueMatch(String(propertyValue));
    }

    return result;
  }

  public toString(): string {
    return this._property.displayText + ' ' + (this._negate ? 'does not ' :
      'does ') + (this._ignoreCase ? 'case-insensitively ' :
      'case-sensitively ') + this._condition + ' ' + this._value;
  }

  // TODO: Should convert propertyValue to any
  private doesValueMatch(propertyValue: string): boolean {
    let matches: boolean = false;
    switch (this._condition) {
      case FilterCriterionCondition.LESS_THAN:
        matches = (+propertyValue < +this._value);
        break;
      case FilterCriterionCondition.LESS_THAN_OR_EQUAL_TO:
        matches = (+propertyValue <= +this._value);
        break;
      case FilterCriterionCondition.EQUALS: {
          let conditionMatcher: RegExp = new RegExp('^' + this.matcher.
            source + '$', this.matcher.flags);
          matches = conditionMatcher.test(propertyValue);
        }
        break;
      case FilterCriterionCondition.CONTAINS:
        matches = this.matcher.test(propertyValue);
        break;
      case FilterCriterionCondition.ENDS_WITH: {
          let conditionMatcher: RegExp = new RegExp(this.matcher.source +
            '$', this.matcher.flags);
          matches = conditionMatcher.test(propertyValue);
        }
        break;
      case FilterCriterionCondition.BEGINS_WITH: {
          let conditionMatcher: RegExp = new RegExp('^' + this.matcher.
            source, this.matcher.flags);
          matches = conditionMatcher.test(propertyValue);
        }
        break;
      case FilterCriterionCondition.MATCHES_REGULAR_EXPRESSION:
        matches = this.matcher.test(propertyValue);
        break;
      case FilterCriterionCondition.GREATER_THAN_OR_EQUAL_TO:
        matches = (+propertyValue >= +this._value);
        break;
      case FilterCriterionCondition.GREATER_THAN:
        matches = (+propertyValue > +this._value);
        break;

      // TODO: Need to prevent returning true for strings containing [], undefined, and null
      case FilterCriterionCondition.IS_EMPTY:
        matches = (propertyValue === '') || (propertyValue === '[]');
        break
      case FilterCriterionCondition.IS_MISSING:
        matches = (propertyValue === 'undefined') || (propertyValue === 'null');
        break;
      case FilterCriterionCondition.IS_EMPTY_OR_MISSING:
        matches = (propertyValue === 'undefined') || (propertyValue === 'null') || (propertyValue === '') || (propertyValue === '[]');
        break;
    }

    return matches;
  }
}

export class FilterCriteriaConnection extends FilterElement {
  private _connections: Array<FilterCriteriaConnection> = [];
  get connections() {
    return this._connections;
  }

  private _criteria: Array<FilterCriterion> = [];
  get criteria() {
    return this._criteria;
  }

  public constructor(public type: FilterCriteriaConnectionType) {
    super();
  }

  public toString(): string {
    if (this.type === FilterCriteriaConnectionType.AND) {
      return 'AND';
    } else {
      return 'OR';
    }
  }
}

export enum FilterCriteriaConnectionType {
  AND, OR
}
