import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { Comparison, Property } from './comparison.class';

export class ItemProxyComparison extends Comparison {
  private _path: Array<Comparison>;
  get path() {
    return this._path;
  }
  set path(path: Array<Comparison>) {
    this._path = path;
    if (this._path.length) {
      // The parent of the current comparison is the last comparison in the path
      this.parent = this._path[this._path.length - 1];
    }
  }

  public constructor(
    baseObject: any,
    changeObject: any,
    private _dynamicTypesService: DynamicTypesService
    ) {
    super(baseObject, changeObject);
  }

  protected getProperties(comparisonObject: any): Array<Property> {
    let properties: Array<Property> = [];

    if (comparisonObject) {
      let koheseType: KoheseType = this._dynamicTypesService.getKoheseTypes()[comparisonObject.kind];
      if (koheseType) {
        for (let propertyId in koheseType.fields) {
          properties.push(new Property(propertyId, propertyId, !!koheseType.fields[propertyId].hidden));
        }
      }
    }

    return properties;
  }
}
