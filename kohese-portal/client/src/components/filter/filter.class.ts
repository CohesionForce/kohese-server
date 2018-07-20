import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

export class Filter {
  private _rootElement: FilterCriteriaConnection =
    new FilterCriteriaConnection(FilterCriteriaConnectionType.AND);
  get rootElement() {
    return this._rootElement;
  }
  
  private _elements: Array<FilterElement> = [];
  get elements() {
    return this._elements;
  }
  
  private _types: Array<KoheseType> = [];
  get types() {
    return this._types;
  }
  set types(types: Array<KoheseType>) {
    this._types = types;
  }
  
  private _properties: Array<string> = [];
  get properties() {
    return this._properties;
  }
  set properties(properties: Array<string>) {
    this._properties = properties;
  }
  
  private _content: string = '';
  get content() {
    return this._content;
  }
  set content(content: string) {
    this._content = content;
  }
  
  private _negateContent: boolean = false;
  get negateContent() {
    return this._negateContent;
  }
  set negateContent(negateContent: boolean) {
    this._negateContent = negateContent;
  }
  
  private _matchesEntireContent: boolean = false;
  get matchesEntireContent() {
    return this._matchesEntireContent;
  }
  set matchesEntireContent(matchesEntireContent: boolean) {
    this._matchesEntireContent = matchesEntireContent;
  }
  
  private _hasUnsavedChanges: boolean = false;
  get hasUnsavedChanges() {
    return this._hasUnsavedChanges;
  }
  set hasUnsavedChanges(hasUnsavedChanges: boolean) {
    this._hasUnsavedChanges = hasUnsavedChanges;
  }
  
  private _hasUncommittedChanges: boolean = false;
  get hasUncommittedChanges() {
    return this._hasUncommittedChanges;
  }
  set hasUncommittedChanges(hasUncommittedChanges: boolean) {
    this._hasUncommittedChanges = hasUncommittedChanges;
  }
  
  public constructor() {
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

export abstract class FilterCriterion extends FilterElement {
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
  
  public constructor(private _condition: any, private _value: string) {
    super();
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
  
  public abstract evaluate(candidate: any): boolean;
  
  public abstract toString(): string;
}

enum TypeFilterCriterionCondition {
  EQUALS = 'equal', SUBCLASS_OF = 'subclass', HAS_PROPERTY = 'have property'
}

export class TypeFilterCriterion extends FilterCriterion {
  public static readonly CONDITIONS: any = TypeFilterCriterionCondition;
  
  public constructor(condition: string, value: string) {
    super(condition, value);
  }
  
  public evaluate(candidate: any): boolean {
    let result: boolean = true;
    switch (this.condition) {
      case TypeFilterCriterionCondition.EQUALS:
        let typeString: string = Object.prototype.toString.call(candidate);
        //result = (this.value === typeString.substring(8, typeString.length -
        //  1));
        result = this.matcher.test(typeString.substring(8, typeString.length - 1));
        break;
      case TypeFilterCriterionCondition.SUBCLASS_OF:
        let anObject: any = candidate;
        let toStringFunction: Function = Object.prototype.toString;
        while (Object.getPrototypeOf(anObject) !== Object.prototype) {
          let typeString: string = Object.prototype.toString.call(anObject);
          //result = (this.value === typeString.substring(8, typeString.length -
          //  1));
          result = this.matcher.test(typeString.substring(8, typeString.length - 1));
          if (result) {
            break;
          }
          anObject = Object.getPrototypeOf(anObject);
        }
        break;
      case TypeFilterCriterionCondition.HAS_PROPERTY:
        result = (null != candidate[this.value]);
        break;
    }
    
    if (this.negate) {
      result = !result;
    }
    
    return result;
  }
  
  public toString(): string {
    return 'The type ' + (this.negate ? 'does not ' : 'does ') + this.
      condition + ' ' + this.value;
  }
}

enum PropertyFilterCriterionCondition {
  LESS_THAN = '<', LESS_THAN_OR_EQUAL_TO = '<=', EQUALS = 'equal',
    CONTAINS = 'contain', ENDS_WITH = 'end with', BEGINS_WITH = 'begin with',
    MATCHES_REGULAR_EXPRESSION = 'match regular expression',
    GREATER_THAN_OR_EQUAL_TO = '>=', GREATER_THAN = '>'
}

export class PropertyFilterCriterion extends FilterCriterion {
  public static readonly CONDITIONS: any = PropertyFilterCriterionCondition;
  
  get propertyName() {
    return this._propertyName;
  }
  set propertyName(propertyName: string) {
    this._propertyName = propertyName;
  }
  
  public constructor(private _propertyName: string, condition: string, value:
    string) {
    super(condition, value);
  }
  
  public getFilterablePropertyNames(): Array<string> {
    return [];
  }
  
  public evaluate(candidate: any): boolean {
    let result: boolean = true;
    for (let propertyName in candidate) {
      if (this._propertyName && (this._propertyName !== propertyName)) {
        continue;
      }
      
      switch (this.condition) {
        case PropertyFilterCriterionCondition.LESS_THAN:
          result = (+candidate[propertyName].toString() < +this.value);
          break;
        case PropertyFilterCriterionCondition.LESS_THAN_OR_EQUAL_TO:
          result = (+candidate[propertyName].toString() <= +this.value);
          break;
        case PropertyFilterCriterionCondition.EQUALS: {
            let conditionMatcher: RegExp = new RegExp('^' + this.matcher.
              source + '$', this.matcher.flags);
            result = conditionMatcher.test(candidate[propertyName].toString());
          }
          break;
        case PropertyFilterCriterionCondition.CONTAINS:
          result = this.matcher.test(candidate[propertyName].toString());
          break;
        case PropertyFilterCriterionCondition.ENDS_WITH: {
            let conditionMatcher: RegExp = new RegExp(this.matcher.source +
              '$', this.matcher.flags);
            result = conditionMatcher.test(candidate[propertyName].toString());
          }
          break;
        case PropertyFilterCriterionCondition.BEGINS_WITH: {
            let conditionMatcher: RegExp = new RegExp('^' + this.matcher.
              source, this.matcher.flags);
            result = conditionMatcher.test(candidate[propertyName].toString());
          }
          break;
        case PropertyFilterCriterionCondition.MATCHES_REGULAR_EXPRESSION:
          result = this.matcher.test(candidate[propertyName].toString());
          break;
        case PropertyFilterCriterionCondition.GREATER_THAN_OR_EQUAL_TO:
          result = (+candidate[propertyName].toString() >= +this.value);
          break;
        case PropertyFilterCriterionCondition.GREATER_THAN:
          result = (+candidate[propertyName].toString() > +this.value);
          break;
      }
      
      if (result) {
        break;
      }
    }
    
    if (this.negate) {
      result = !result;
    }
    
    return result;
  }
  
  public toString(): string {
    return (this._propertyName ? this._propertyName : 'A property ') + (this.
      negate ? 'does not ' : 'does ') + (this.ignoreCase ?
      'case-insensitively ' : 'case-sensitively ') + this.condition + ' ' +
      this.value;
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
