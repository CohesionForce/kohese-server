import { MockDataModel } from '../data/MockDataModel';

export class MockStateFilterService {
  public constructor() {
  }
  
  public getStateInfoFor(typeNames: Array<string>): object {
    let stateObject: object = MockDataModel().properties['decisionState'][
      'properties']['state'];
    let descriptions: Array<string> = [];
    for (let stateName in stateObject) {
      descriptions.push(stateObject[stateName].description);
    }
    
    return {
      'Kurios Iesous': {
        'decisionState': {
          states: Object.keys(stateObject),
          descriptions: descriptions
        }
      }
      };
  }
}