import { Filter, FilterCriteriaConnection, FilterCriteriaConnectionType,
  TypeFilterCriterion, PropertyFilterCriterion } from './filter.class';

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
    connection.criteria.push(new TypeFilterCriterion(TypeFilterCriterion.CONDITIONS.
      EQUALS, 'evaluationobject'));
    let orPropertyFilterCriterion: PropertyFilterCriterion =
      new PropertyFilterCriterion('', PropertyFilterCriterion.CONDITIONS.
      CONTAINS, 'value');
    orPropertyFilterCriterion.negate = true;
    connection.criteria.push(orPropertyFilterCriterion);
    filter.rootElement.connections.push(connection);
    filter.rootElement.criteria.push(new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.LESS_THAN, '3'));
  });
  
  it('filters based on criteria', () => {
    let results: Array<any> = filter.filter([evaluationObject]);
    expect(results.indexOf(evaluationObject)).toEqual(-1);
    filter.rootElement.criteria[0].negate = true;
    results = filter.filter([evaluationObject]);
    expect(results.indexOf(evaluationObject)).not.toEqual(-1);
  });
});

describe('Class: TypeFilterCriterion', () => {
  it('evaluates whether the type of an object is a particular type', () => {
    let criterion: TypeFilterCriterion = new TypeFilterCriterion(
      TypeFilterCriterion.CONDITIONS.EQUALS, 'evaluationobject');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'Evaluation Object';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether an object is a subclass of a type', () => {
    let criterion: TypeFilterCriterion = new TypeFilterCriterion(
      TypeFilterCriterion.CONDITIONS.SUBCLASS_OF, 'evaluationobject');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'Evaluation Object';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether an object has a particular property', () => {
    let criterion: TypeFilterCriterion = new TypeFilterCriterion(
      TypeFilterCriterion.CONDITIONS.HAS_PROPERTY, '_numericproperty');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'numericproperty';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
});

describe('Class: PropertyFilterCriterion', () => {
  it('evaluates whether a property value is < a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.LESS_THAN, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
    criterion.value = '7';
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
  });
  
  it('evaluates whether a property value is <= to a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.LESS_THAN_OR_EQUAL_TO, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '1';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value equals a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.EQUALS, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '7';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value contains a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.CONTAINS, 'String');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'value';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value matches a regular expression', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.MATCHES_REGULAR_EXPRESSION,
      '/prop/i');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '/prop/';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value ends with a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.ENDS_WITH, 'Property');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'value';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value begins with a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.BEGINS_WITH, 'String');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = 'value';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value is >= a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.GREATER_THAN_OR_EQUAL_TO, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
    criterion.value = '7';
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
  });
  
  it('evaluates whether a property value is > a value', () => {
    let criterion: PropertyFilterCriterion = new PropertyFilterCriterion('',
      PropertyFilterCriterion.CONDITIONS.GREATER_THAN, '3');
    expect(criterion.evaluate(evaluationObject)).toEqual(false);
    criterion.value = '1';
    expect(criterion.evaluate(evaluationObject)).toEqual(true);
  });
});
