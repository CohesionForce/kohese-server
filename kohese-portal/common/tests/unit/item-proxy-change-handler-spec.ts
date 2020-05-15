import { ItemProxy } from '../../../common/src/item-proxy';
import { KoheseModel } from '../../../common/src/KoheseModel';
const kdbFS = require('../../../server/kdb-fs');
const _ = require('underscore');

describe('ItemProxy ItemChangeHandler Test:', () => {
  let itemModel : KoheseModel;
  let koheseModelModel : KoheseModel;
  let koheseUserModel : KoheseModel;
  let internalModel : KoheseModel;
  loadMetamodels();

  function loadMetamodels() {
    let itemDefinition = kdbFS.loadJSONDoc('./common/models/Item.json');

    itemDefinition.properties.aStringField = {
      "type": "string",
      "name": "aStringField"
    };

    itemDefinition.properties.aBooleanField = {
      "type": "boolean",
      "name": "aBooleanField"
    };

    itemDefinition.properties.aNumberField = {
      "type": "number",
      "name": "aNumberField"
    };

    itemDefinition.properties.aStringArrayField = {
      "type": [ "string" ],
      "name": "aStringArrayField"
    };

    itemModel = new KoheseModel(itemDefinition);

    let koheseModelDefinition = kdbFS.loadJSONDoc('./common/models/KoheseModel.json');

    koheseModelDefinition.properties.aLDTField = {
      "name": "BasicPath",
      "type": "PropertyType",
      "required": false,
      "relation": {
        "contained": true,
        "kind": "Item",
        "foreignKey": "id"
      }
    };

    koheseModelDefinition.properties.aLDTArrayField = {
      "name": "BasicPath",
      "type": [ "PropertyType" ],
      "required": false,
      "relation": {
        "contained": true,
        "kind": "Item",
        "foreignKey": "id"
      }
    };

    koheseModelModel = new KoheseModel(koheseModelDefinition);

    let koheseUserDefinition = kdbFS.loadJSONDoc('./common/models/KoheseUser.json');
    koheseUserModel = new KoheseModel(koheseUserDefinition);

    let internalDefinition = kdbFS.loadJSONDoc('./common/models/Internal.json');
    internalModel = new KoheseModel(internalDefinition);

    KoheseModel.modelDefinitionLoadingComplete();
    ItemProxy.getWorkingTree().loadingComplete();
  }

  function testField(proxy, field, initialValue, changedValue, changedAgainValue, undefinedValue) {
    expect(proxy.dirty).toBeFalsy();

    // TODO: Need to support testing of nested fields

    // Set a property
    console.log('::: Setting field: ' + field);
    proxy.item[field] = initialValue;
    expect(_.clone(proxy.item[field])).toEqual(initialValue);
    expect(proxy._item[field]).toEqual(initialValue);
    expect(proxy.dirty).toBeTruthy();
    expect(proxy.dirtyFields[field].from).toBeUndefined();
    expect(proxy.dirtyFields[field].to).toEqual(initialValue);
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    // Update item
    proxy.updateItem(proxy.kind, proxy.item);
    expect(_.clone(proxy.item[field])).toEqual(initialValue);
    expect(proxy._item[field]).toEqual(initialValue);
    expect(proxy.dirty).toBeFalsy();
    expect(proxy.hasOwnProperty('dirtyFields')).toBe(false);

    // Change the property
    console.log('::: Changing field: ' + field);
    proxy.item[field] = changedValue;
    expect(_.clone(proxy.item[field])).toEqual(changedValue);
    expect(proxy._item[field]).toEqual(changedValue);
    expect(proxy.dirty).toBeTruthy();
    expect(proxy.dirtyFields[field].from).toEqual(initialValue);
    expect(proxy.dirtyFields[field].to).toEqual(changedValue);
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    // Update item
    proxy.updateItem(proxy.kind, proxy.item);
    expect(proxy.dirty).toBeFalsy();
    expect(proxy.hasOwnProperty('dirtyFields')).toBe(false);

    // Change the property again
    console.log('::: Changing field again: ' + field);
    proxy.item[field] = changedAgainValue;
    expect(_.clone(proxy.item[field])).toEqual(changedAgainValue);
    expect(proxy._item[field]).toEqual(changedAgainValue);
    expect(proxy.dirty).toBeTruthy();
    expect(proxy.dirtyFields[field].from).toEqual(changedValue);
    expect(proxy.dirtyFields[field].to).toEqual(changedAgainValue);
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    // Change the property back
    console.log('::: Changing field back: ' + field);
    proxy.item[field] = changedValue;
    expect(proxy.dirty).toBeFalsy();
    expect(proxy.hasOwnProperty('dirtyFields')).toBe(false);
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    // Change the property to undefined
    console.log('::: Changing field to undefined: ' + field);
    proxy.item[field] = undefinedValue;
    expect(proxy.item[field]).toEqual(undefined);
    expect(proxy._item[field]).toEqual(undefined);
    expect(proxy.dirty).toBeTruthy();
    expect(proxy.dirtyFields[field].from).toEqual(changedValue);
    expect(proxy.dirtyFields[field].to).toEqual(undefined);
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    // Change the property back
    console.log('::: Changing field back: ' + field);
    proxy.item[field] = changedValue;
    expect(proxy.dirty).toBeFalsy();
    expect(proxy.hasOwnProperty('dirtyFields')).toBe(false);
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    console.log('::: Deleting field: ' + field);
    delete proxy.item[field];
    expect(proxy.item.hasOwnProperty(field)).toBe(false);
    expect(proxy._item.hasOwnProperty(field)).toBe(false);
    expect(proxy.dirty).toBeTruthy();
    expect(proxy.dirtyFields[field].from).toEqual(changedValue);
    expect(proxy.dirtyFields[field].to).toBeUndefined();
    console.log(JSON.stringify(proxy.dirtyFields, null, '  '));

    console.log('::: Updating proxy with deletion');
    proxy.updateItem('Item', proxy.item);
  }

  xit('should supply automatic properties', () => {
    // TODO: Add test for return of kind
    // TODO: Add test for return of vcStatus
  });

  it('should detect ItemChangeHandler', () => {

    console.log ('::: Checking that ICH is detected');

    let proxy = new ItemProxy('Item', {
      id: 'test-uuid',
      name: 'Test Item'
    });

    expect(proxy.item.$isItemChangeHandler).toBeTruthy();

    proxy.item.aStringArrayField = [ 'test' ];
    expect(proxy.item.aStringArrayField.$isItemChangeHandler).toBeTruthy();

    // TODO: Add test for nested LDT

    proxy.deleteItem();
  });

  it('should detect dirty string', () => {

    // Define the item
    let proxy = new ItemProxy('Item', {
      id: 'test-uuid',
      name: 'Test Item'
    });

    testField(proxy, 'aStringField', 'test', 'test-changed', 'test-changed-again', undefined);

    proxy.deleteItem();
  
  });

  it('should detect dirty boolean', () => {

    // Define the item
    let proxy = new ItemProxy('Item', {
      id: 'test-uuid',
      name: 'Test Item'
    });


    testField(proxy, 'aBooleanField', true, false, true, undefined);
    testField(proxy, 'aBooleanField', false, true, false, undefined);

    proxy.deleteItem();
  
  });

  it('should detect dirty number', () => {

    // Define the item
    let proxy = new ItemProxy('Item', {
      id: 'test-uuid',
      name: 'Test Item'
    });


    testField(proxy, 'aNumberField', 1, 2, 3, undefined);

    proxy.deleteItem();
  
  });

  it('should detect dirty array data', () => {

    // Define the item
    let proxy = new ItemProxy('Item', {
      id: 'test-uuid',
      name: 'Test Item'
    });


    testField(proxy, 'aStringArrayField', [ 'test' ], [ 'test-changed' ], [ 'test-changed-again' ], undefined);

    proxy.item.aStringArrayField = [];
    proxy.item.aStringArrayField.push('first');
    proxy.item.aStringArrayField.push('second');
    expect(proxy.dirtyFields['aStringArrayField.0'].to).toEqual('first');
    expect(proxy.dirtyFields['aStringArrayField.1'].to).toEqual('second');

    proxy.deleteItem();
  });

  it('should associate typeProperties with a LDT', () => {
    // Define the item
    let proxy = koheseModelModel;

    proxy.item.aLDTField = {
      name: 'TestProperty',
      id: 'test-property'
    };

    proxy.item.aLDTField.id = 'change-id';
    expect(proxy.item.aLDTField.id).toBe('change-id');
    expect(proxy.item.aLDTField.name).toBe('TestProperty');
    expect(proxy.dirtyFields['aLDTField.id'].from).toBe('test-property');
    expect(proxy.dirtyFields['aLDTField.id'].to).toBe('change-id');
    // console.log('%%% Item TypeProperties: ' + proxy.item.$typeDecl);
    // console.log(JSON.stringify(proxy.item.$typeProperties, null, '  '));
    // console.log('%%% aLDTField TypeProperties: ' + proxy.item.aLDTField.$typeDecl);
    // console.log(JSON.stringify(proxy.item.aLDTField.$typeProperties, null, '  '));
  });

  it('should associate typeProperties with an LDT Array', () => {
    // Define the item
    let proxy = koheseModelModel;

    proxy.item.aLDTArrayField = [];
    
    proxy.item.aLDTArrayField.push({
      name: 'TestProperty',
      id: 'test-property'
    });

    proxy.item.aLDTArrayField[0].id = 'change-id';
    expect(proxy.item.aLDTArrayField.$typeDecl).toEqual([ 'PropertyType' ]);
    expect(proxy.item.aLDTArrayField[0].id).toBe('change-id');
    expect(proxy.item.aLDTArrayField[0].name).toBe('TestProperty');
    // expect(proxy.dirtyFields['aLDTArrayField.0.id'].from).toBe('test-property');
    // expect(proxy.dirtyFields['aLDTArrayField.0'].to.id).toBe('change-id');
    expect(proxy.item.aLDTArrayField[0].$typeDecl).toEqual('PropertyType');
    // console.log('%%% aLDTArrayField TypeProperties: ' + proxy.item.aLDTArrayField[0].$typeDecl);
    // console.log(JSON.stringify(proxy.item.aLDTArrayField[0].$typeProperties, null, '  '));
  });

});