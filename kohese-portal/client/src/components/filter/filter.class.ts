export enum ValueInputType {
  STRING, NUMBER, SELECT
}

export class FilterableProperty {
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
    
    return true;
  }
}

export class FilterElement {
  protected constructor() {
  }
}

enum FilterCriterionCondition {
  LESS_THAN = '<', LESS_THAN_OR_EQUAL_TO = '<=', EQUALS = 'equal',
    CONTAINS = 'contain',
    MATCHES_REGULAR_EXPRESSION = 'match regular expression',
    ENDS_WITH = 'end with', BEGINS_WITH = 'begin with',
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
  }
  
  protected matcher: RegExp;
  
  public constructor(private _property: FilterableProperty, private _condition:
    any, private _value: string) {
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
    if (this._property.values.length > 0) {
      let propertyPath: Array<string> = this._property.propertyPath.slice(0);
      let property: any = candidate;
      for (let j: number = 0; j < propertyPath.length - 1; j++) {
        property = property[propertyPath[j]];
      }
      let propertyValue: string = String(property[propertyPath[propertyPath.
        length - 1]]);
      result = this.doesValueMatch(propertyValue);
    } else {
      for (let propertyName in candidate) {
        result = this.doesValueMatch(String(candidate[propertyName]));
        
        if (result) {
          break;
        }
      }
    }
    
    if (this.negate) {
      result = !result;
    }
    
    return result;
  }
  
  public toString(): string {
    return this._property.displayText + ' ' + (this.negate ? 'does not ' :
      'does ') + (this.ignoreCase ? 'case-insensitively ' :
      'case-sensitively ') + this.condition + ' ' + this.value;
  }
  
  private doesValueMatch(propertyValue: string): boolean {
    let matches: boolean = false;
    switch (this.condition) {
      case FilterCriterionCondition.LESS_THAN:
        matches = (+propertyValue < +this.value);
        break;
      case FilterCriterionCondition.LESS_THAN_OR_EQUAL_TO:
        matches = (+propertyValue <= +this.value);
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
        matches = (+propertyValue >= +this.value);
        break;
      case FilterCriterionCondition.GREATER_THAN:
        matches = (+propertyValue > +this.value);
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
