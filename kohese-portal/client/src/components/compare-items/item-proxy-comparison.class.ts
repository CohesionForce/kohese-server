import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { Comparison, Property } from './comparison.class';

export class ItemProxyComparison extends Comparison {
  private _path: string;
  get path() {
    return this._path;
  }
  set path(path: string) {
    this._path = path;
  }
  
  public constructor(baseObject: any, changeObject: any,
    private _dynamicTypesService: DynamicTypesService) {
    super(baseObject, changeObject);
  }
  
  protected getProperties(comparisonObject: any): Array<Property> {
    let properties: Array<Property> = [];
    
    properties.push(new Property('kind', 'Kind'));
    
    let koheseType: KoheseType = this._dynamicTypesService.getKoheseTypes()[
      comparisonObject.kind];
    if (koheseType) {
      for (let propertyId in koheseType.fields) {
        if (koheseType.fields[propertyId].views['form']) {
          properties.push(new Property(propertyId, koheseType.fields[
            propertyId].views['form'].displayName));
        }
      }
    }
    
    properties.push(new Property('itemIds', 'Children'));
    
    return properties;
  }
}