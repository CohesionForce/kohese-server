import * as JsDiff from 'diff';
import * as jsSHA_Import from 'jssha';

//
// Adjust for the differences in CommonJS and ES6 for jssha
//
let jsSHA;
if (typeof(jsSHA_Import) === 'object') {
  jsSHA = (<any>jsSHA_Import).default;
} else {
  jsSHA = jsSHA_Import;
}

export class Property {
  public constructor(
    public id: string,
    public name: string,
    public hidden: boolean
  ) {}
}

export enum ChangeType {
  CONTENT_CHANGED    = 'Content Changed',   TYPE_CHANGED  = 'Type Changed',
  PARENT_CHANGED     = 'Parent Changed',    CHILD_ADDED   = 'Child Added',
  CHILD_MODIFIED     = 'Child Modified',    CHILD_REMOVED = 'Child Removed',
  CHILDREN_REORDERED = 'Children Reordered'
}

export class Comparison {
  public propertyDiffPending : boolean;
  public propertyDiffInProgress : boolean;

  get baseObject() {
    return this._baseObject;
  }

  get changeObject() {
    return this._changeObject;
  }

  private _propertyComparisonMap: Map<Property, Array<any>> = new Map<Property, Array<any>>();
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

  public constructor(private _baseObject: any, private _changeObject: any) {}

  public async compare(deferPropertyDiffs: boolean = false): Promise<void> {
    // Populate comparison map with baseObject properties
    let baseObjectProperties: Array<Property> = this.getProperties(this._baseObject);
    for (let basePropertyIndex: number = 0; basePropertyIndex < baseObjectProperties.length; basePropertyIndex++) {
      // Adding properties for everything in the base with a placeholder of an empty array used for pushing later.
      const emptyDiffArray = [];
      this._propertyComparisonMap.set(baseObjectProperties[basePropertyIndex], emptyDiffArray);
    }

    // Populate comparison map with changeObject properties that are not in the baseObject
    let changeObjectProperties: Array<Property> = this.getProperties(this._changeObject);
    for (let changePropertyIndex: number = 0; changePropertyIndex < changeObjectProperties.length; changePropertyIndex++) {
      let presentInBase: boolean = false;
      for (let basePropertyIndex: number = 0; basePropertyIndex < baseObjectProperties.length; basePropertyIndex++) {
        if (changeObjectProperties[changePropertyIndex].id === baseObjectProperties[basePropertyIndex].id) {
          presentInBase = true;
          break;
        }
      }

      if (!presentInBase) {
        // Adding properties for everything in the base with a placeholder of an empty array used for pushing later.
        // (only changed properties)
        const emptyDiffArray = [];
        this._propertyComparisonMap.set(changeObjectProperties[changePropertyIndex], emptyDiffArray);
      }
    }

    this.propertyDiffPending = true;
    if (!deferPropertyDiffs) {
      // Immediately Force the calculation of property differences
      await this.compareProperties();
    }
  }

  //////////////////////////////////////////////////////////////////////////
  public async compareProperties() {
    if (this.propertyDiffPending && !this.propertyDiffInProgress) {
      this.propertyDiffInProgress = true;
      let properties: Array<Property> = Array.from(this._propertyComparisonMap.keys());
      this._numberOfHiddenProperties = 0;
      for (let j: number = 0; j < properties.length; j++) {
        if (properties[j].hidden) {
          this._numberOfHiddenProperties++;
        }

        let baseValue: any = this.getPropertyValue(properties[j], this._baseObject);
        if (null == baseValue) {
          baseValue = '';
        }

        baseValue = await this.adjustPropertyValue(String(baseValue), this._baseObject);
        baseValue = this.replaceImage(baseValue);

        let changeValue: any = this.getPropertyValue(properties[j], this._changeObject);
        if (null == changeValue) {
          changeValue = '';
        }

        changeValue = await this.adjustPropertyValue(String(changeValue), this._changeObject);
        changeValue = this.replaceImage(changeValue);

        this._propertyComparisonMap.get(properties[j]).push(...JsDiff.diffWords(baseValue, changeValue));
      }

      this.propertyDiffPending = false;
      this.propertyDiffInProgress = false;
    }
  }

  //////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////
  protected getProperties(comparisonObject: any): Array<Property> {
    let properties: Array<Property> = [];
    if(comparisonObject) {
      for (let property in comparisonObject) {
        // Possibly base vs changed (i.e. change) property
        properties.push(new Property(property, property, false));
      }
    }
    // Returns an empty array if there are no properties on the comparisonObject
    return properties;
  }

  //////////////////////////////////////////////////////////////////////////
  // Returns property value if it exists.
  //////////////////////////////////////////////////////////////////////////
  protected getPropertyValue(property: Property, comparisonObject: any): any {
    return comparisonObject ? comparisonObject[property.id]: null;
  }

  //////////////////////////////////////////////////////////////////////////
  // This function calculates an OID that is equivalent to the one calculated
  // natively by git for the contents of a blob
  //////////////////////////////////////////////////////////////////////////
  protected calcBlobOID(forText) {

    var length = forText.length;

    var shaObj = new jsSHA('SHA-1', 'TEXT');

    shaObj.update('blob ' + length + '\0' + forText);

    var oid = shaObj.getHash('HEX');

    return oid;
  }

  //////////////////////////////////////////////////////////////////////////
  // Present to make diffing of images faster
  //////////////////////////////////////////////////////////////////////////
  protected  replaceImage(inString: string) : String {
    let newString = new String(inString);
    let base64RegEx = /(\!\[[^\]]*\])(\(data:image\/[a-zA-Z]*;base64,)([^\)]*)(\))/;
    let hasImage = newString.match(base64RegEx);
    while (hasImage) {
      let imageOID = this.calcBlobOID(hasImage[3]);
      newString = newString.replace(base64RegEx,'$1(koid://' + imageOID +')');
      // console.log('^^^ Replacing image: ' + imageOID);
      hasImage = newString.match(base64RegEx);
    }
    return newString;
  }

  //////////////////////////////////////////////////////////////////////////
  public async adjustPropertyValue(propertyValue: string, comparisonObject: any): Promise<string> {
    return propertyValue;
  }
}
