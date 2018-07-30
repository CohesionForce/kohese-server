import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { Filter, ValueInputType, FilterableProperty } from './filter.class';

export class ItemProxyFilter extends Filter {
  public constructor(private _dynamicTypesService: DynamicTypesService,
    private _itemRepository: ItemRepository) {
    super();
    this._itemRepository.getTreeConfig().subscribe((treeConfigurationObject:
      any) => {
      if (treeConfigurationObject) {
        let typeNames: Array<string> = Object.keys(this._dynamicTypesService.
          getKoheseTypes()).sort();
        let intermediateFilterablePropertyArray: Array<FilterableProperty> =
          [];
        for (let j: number = 0; j < typeNames.length; j++) {
          let properties: any = treeConfigurationObject.config.getProxyFor(
            typeNames[j]).item.properties;
          let propertyNames: Array<string> = Object.keys(properties);
          for (let k: number = 0; k < propertyNames.length; k++) {
            let valueInputType: ValueInputType = ValueInputType.STRING;
            switch (properties[propertyNames[k]].type) {
              case 'number':
                valueInputType = ValueInputType.NUMBER;
                break;
            }
            intermediateFilterablePropertyArray.push(new FilterableProperty(
              propertyNames[k], [propertyNames[k]], valueInputType, []));
          }
        }
        
        intermediateFilterablePropertyArray.push(new FilterableProperty('kind',
          ['kind'], ValueInputType.SELECT, typeNames));
        
        intermediateFilterablePropertyArray.sort((oneProperty:
          FilterableProperty, anotherProperty: FilterableProperty) => {
          return (oneProperty.displayText > anotherProperty.displayText ? 1 :
            (oneProperty.displayText < anotherProperty.displayText ? -1 : 0));
        });
        
        this.filterableProperties.push(...intermediateFilterablePropertyArray);
      }
    });
  }
}
