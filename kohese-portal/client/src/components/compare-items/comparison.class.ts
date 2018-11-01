import * as JsDiff from 'diff';

export class Property {
  public constructor(public id: string, public name: string, public hidden:
    boolean) {
  }
}

export enum ChangeType {
  CONTENT_CHANGED = 'Content Changed', TYPE_CHANGED = 'Type Changed',
    PARENT_CHANGED = 'Parent Changed', CHILD_ADDED = 'Child Added',
    CHILD_MODIFIED = 'Child Modified', CHILD_REMOVED = 'Child Removed',
    CHILDREN_REORDERED = 'Children Reordered'
}

export class Comparison {
  get baseObject() {
    return this._baseObject;
  }

  get changeObject() {
    return this._changeObject;
  }

  private _propertyComparisonMap: Map<Property, Array<any>> =
    new Map<Property, Array<any>>();
  get propertyComparisonMap() {
    return this._propertyComparisonMap;
  }

  private _changeTypes: Array<ChangeType> = [];
  get changeTypes() {
    return this._changeTypes;
  }

  private _numberOfHiddenProperties: number;
  get numberOfHiddenProperties() {
    return this._numberOfHiddenProperties;
  }

  public static readonly UUID_REGULAR_EXPRESSION: RegExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public constructor(private _baseObject: any, private _changeObject: any) {
  }

  public async compare(): Promise<void> {
    let baseObjectProperties: Array<Property> = this.getProperties(this.
      _baseObject);
    for (let j: number = 0; j < baseObjectProperties.length; j++) {
      this._propertyComparisonMap.set(baseObjectProperties[j], []);
    }

    let changeObjectProperties: Array<Property> = this.getProperties(this.
      _changeObject);
    for (let j: number = 0; j < changeObjectProperties.length; j++) {
      let present: boolean = false;
      let properties: Array<Property> = Array.from(this._propertyComparisonMap.
        keys());
      for (let k: number = 0; k < properties.length; k++) {
        if (changeObjectProperties[j].id === properties[k].id) {
          present = true;
          break;
        }
      }

      if (!present) {
        this._propertyComparisonMap.set(changeObjectProperties[j], []);
      }
    }

    let properties: Array<Property> = Array.from(this._propertyComparisonMap.
      keys());
    this._numberOfHiddenProperties = 0;
    for (let j: number = 0; j < properties.length; j++) {
      if (properties[j].hidden) {
        this._numberOfHiddenProperties++;
      }

      let baseValue: any = this.getPropertyValue(properties[j], this.
        _baseObject);
      if (null == baseValue) {
        baseValue = '';
      }

      baseValue = await this.adjustPropertyValue(String(baseValue), this.
        _baseObject);

      let changeValue: any = this.getPropertyValue(properties[j], this.
        _changeObject);
      if (null == changeValue) {
        changeValue = '';
      }

      changeValue = await this.adjustPropertyValue(String(changeValue), this.
        _changeObject);

      this._propertyComparisonMap.get(properties[j]).push(...JsDiff.
        diffWords(baseValue, changeValue));
    }
  }

  public static getChangeIconString(changeType: ChangeType): string {
    let iconClass: string = '';
    switch (changeType) {
      case ChangeType.CONTENT_CHANGED:
        iconClass = 'fa fa-pencil';
        break;
      case ChangeType.TYPE_CHANGED:
        iconClass = 'fa fa-sitemap';
        break;
      case ChangeType.PARENT_CHANGED:
        iconClass = 'fa fa-arrow-up';
        break;
      case ChangeType.CHILD_ADDED:
        iconClass = 'fa fa-plus';
        break;
      case ChangeType.CHILD_MODIFIED:
        iconClass = 'fa fa-arrow-down';
        break;
      case ChangeType.CHILD_REMOVED:
        iconClass = 'fa fa-minus';
        break;
      case ChangeType.CHILDREN_REORDERED:
        iconClass = 'fa fa-exchange';
        break;
    }

    return iconClass;
  }

  protected getProperties(comparisonObject: any): Array<Property> {
    let properties: Array<Property> = [];
    for (let propertyId in comparisonObject) {
      properties.push(new Property(propertyId, propertyId, false));
    }

    return properties;
  }

  protected getPropertyValue(property: Property, comparisonObject: any): any {
    return comparisonObject[property.id];
  }

  public async adjustPropertyValue(propertyValue: string, comparisonObject: any):
    Promise<string> {
    return propertyValue;
  }
}
