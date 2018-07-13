import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

export class Filter {
  private _rootElement: FilterCriteriaConnection =
    new FilterCriteriaConnection(FilterCriteriaConnectionType.OR, 0);
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
      let matches: boolean = true;
      for (let k: number = 0; k < this._elements.length; k++) {
        let element: FilterElement = this._elements[k];
        if (element instanceof FilterCriterion) {
          matches = (element as FilterCriterion).evaluate(object);
        } else {
          if ((!matches && (element as FilterCriteriaConnection).type === FilterCriteriaConnectionType.AND) ||
            (matches && (element as FilterCriteriaConnection).type === FilterCriteriaConnectionType.OR)) {
            break;
          }
        }
      }
      
      if (matches) {
        matchingObjects.push(object);
      }
    }
    
    return matchingObjects;
  }
}

export class FilterElement {
  get depth() {
    return this._depth;
  }
  set depth(depth: number) {
    this._depth = depth;
  }
  
  protected constructor(private _depth: number) {
  }
}

export class FilterCriterion extends FilterElement {
  public static readonly CONDITIONS: any = {
    Object: {
      'TYPE_EQUALS': 'type equals',
      'SUBCLASS_OF': 'subclass of',
      'HAS_PROPERTY': 'has property'
    },
    Property: {
      'LESS_THAN': '<',
      'LESS_THAN_OR_EQUAL_TO': '<=',
      'EQUALS': '=',
      'CONTAINS': 'contains',
      'ENDS_WITH': 'ends with',
      'BEGINS_WITH': 'begins with',
      'GREATER_THAN_OR_EQUAL_TO': '>=',
      'GREATER_THAN': '>'
    }
  };
  
  get negate() {
    return this._negate;
  }
  set negate(negate: boolean) {
    this._negate = negate;
  }
  
  get condition() {
    return this._condition;
  }
  set condition(condition: string) {
    this._condition = condition;
  }
  
  get value() {
    return this._value;
  }
  set value(value: string) {
    this._value = value;
  }
  
  public constructor(private _negate: boolean, private _condition: string,
    private _value: string, depth: number) {
    super(depth);
  }
  
  public static getDefaultTrueCriterion(depth: number): FilterCriterion {
    return new FilterCriterion(false, FilterCriterion.CONDITIONS.Property.
      BEGINS_WITH, '', depth);
  }
  
  public static getDefaultFalseCriterion(depth: number): FilterCriterion {
    return new FilterCriterion(true, FilterCriterion.CONDITIONS.Property.
      BEGINS_WITH, '', depth);
  }
  
  public evaluate(candidate: any): boolean {
    let result: boolean = true;
    switch (this._condition) {
      case FilterCriterion.CONDITIONS.Property.LESS_THAN:
        result = (+candidate.toString() < +this._value);
        break;
      case FilterCriterion.CONDITIONS.Property.LESS_THAN_OR_EQUAL_TO:
        result = (+candidate.toString() <= +this._value);
        break;
      case FilterCriterion.CONDITIONS.Property.EQUALS:
        result = (candidate.toString() === this._value);
        break;
      case FilterCriterion.CONDITIONS.Property.CONTAINS:
        result = (candidate.toString().contains(this._value));
        break;
      case FilterCriterion.CONDITIONS.Property.ENDS_WITH:
        result = (candidate.toString().endsWith(this._value));
        break;
      case FilterCriterion.CONDITIONS.Property.BEGINS_WITH:
        result = (candidate.toString().startsWith(this._value));
        break;
      case FilterCriterion.CONDITIONS.Property.GREATER_THAN_OR_EQUAL_TO:
        result = (+candidate.toString() >= +this._value);
        break;
      case FilterCriterion.CONDITIONS.Property.GREATER_THAN:
        result = (+candidate.toString() > +this._value);
        break;
      case FilterCriterion.CONDITIONS.Object.TYPE_EQUALS:
        let typeString: string = Object.prototype.toString.call(candidate);
        result = (this._value === typeString.substring(8, typeString.length -
          1));
        break;
      case FilterCriterion.CONDITIONS.Object.SUBCLASS_OF:
        let anObject: any = candidate;
        let toStringFunction: Function = Object.prototype.toString;
        while (Object.getPrototypeOf(anObject) !== Object.prototype) {
          let typeString: string = Object.prototype.toString.call(anObject);
          result = (this._value === typeString.substring(8, typeString.length -
            1));
          if (result) {
            break;
          }
          anObject = Object.getPrototypeOf(anObject);
        }
        break;
      case FilterCriterion.CONDITIONS.Object.HAS_PROPERTY:
        result = (null != candidate[this._value]);
        break;
    }
    
    if (this._negate) {
      result = !result;
    }
    
    return result;
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
  
  public constructor(public type: FilterCriteriaConnectionType,
    depth: number) {
    super(depth);
  }
}

export enum FilterCriteriaConnectionType {
  AND, OR
}
