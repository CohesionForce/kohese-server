import { KoheseType } from '../../classes/UDT/KoheseType.class';
import { ItemProxy } from '../../../../common/src/item-proxy';

export class Filter {
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
  
  public filter(proxies: Array<ItemProxy>): Array<ItemProxy> {
    let matchingProxies: Array<ItemProxy> = [];
    for (let j: number = 0; j < proxies.length; j++) {
      let proxy: ItemProxy = proxies[j];
      let matches: boolean = true;
      if (this._hasUncommittedChanges && (Object.keys(proxy.status).length === 0)) {
        matches = false;
      } else if (this._hasUnsavedChanges && !proxy.dirty) {
        matches = false;
      }
      
      if ((this._types.length > 0) && (-1 === this._types.indexOf(proxy.model.
        type))) {
        matches = false;
      }
      
      if (matches && this._content) {
        matches = false;
        let filterExpression: RegExp;
        let filterIsRegex: Array<string> = this._content.match(new RegExp(
          '^\/(.*)\/([gimy]*)$'));
        if (filterIsRegex) {
          filterExpression = new RegExp(filterIsRegex[1], filterIsRegex[2]);
        } else {
          let cleanedPhrase: string = this._content.replace(
            /[.*+?^${}()|[\]\\]/g, '\\$&');
          filterExpression = new RegExp(this._content, 'i');
        }
        
        let propertiesToCheck: Array<string>;
        if (this._properties.length > 0) {
          for (let k: number = 0; k < this._properties.length; k++) {
            if (proxy.item[this._properties[k]]) {
              propertiesToCheck.push(this._properties[k]);
            }
          }
        } else {
          propertiesToCheck = Object.keys(proxy.item);
        }
        
        for (let k: number = 0; k < propertiesToCheck.length; k++) {
          let propertyAsString: string = proxy.item[propertiesToCheck[k]].
            toString();
          if (this._negateContent) {
            if (!propertyAsString.match(filterExpression)) {
              matches = true;
              break;
            }
          } else {
            if (propertyAsString.match(filterExpression)) {
              matches = true;
              break;
            }
          }
        }
      }
      
      if (matches) {
        matchingProxies.push(proxy);
      }
    }
    
    return matchingProxies;
  }
}