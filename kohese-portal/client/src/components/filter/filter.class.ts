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
  LESS_THAN = '<', LESS_THAN_OR_EQUAL_TO = '<=', EQUALS = 'equals', CONTAINS =
    'contains', MATCHES_REGULAR_EXPRESSION = 'matches regular expression',
    ENDS_WITH = 'ends with', BEGINS_WITH = 'begins with',
    GREATER_THAN_OR_EQUAL_TO = '>=', GREATER_THAN = '>'
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
  
  public evaluate(candidate: any): boolean {
    let result: boolean = true;
    if (this._property.propertyPath.length > 0) {
      let propertyPath: Array<string> = this._property.propertyPath.slice(0);
      let property: any = candidate;
      for (let j: number = 0; j < propertyPath.length - 1; j++) {
        property = property[propertyPath[j]];
      }
      
      let lastPropertyPathSegment: string = propertyPath[propertyPath.length -
        1];
      if (lastPropertyPathSegment === FilterableProperty.PROPERTIES) {
        result = (-1 !== Object.keys(property).indexOf(this.value));
      } else {
        result = this.doesValueMatch(String(property[
          lastPropertyPathSegment]));
      }
    } else {
      for (let propertyName in candidate) {
        result = this.doesValueMatch(String(candidate[propertyName]));
        
        if (result) {
          break;
        }
      }
    }

    if (this._negate) {
      result = !result;
    }

    return result;
  }

  public toString(): string {
    return this._property.displayText + ' ' + (this._negate ? 'does not ' :
      'does ') + (this._ignoreCase ? 'case-insensitively ' :
      'case-sensitively ') + this._condition + ' ' + this._value;
  }
  
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
