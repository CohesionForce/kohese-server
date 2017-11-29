describe('ItemProxy Test', function() {

  var ItemProxy = require('../../../common/models/item-proxy.js');

  var root = ItemProxy.getRootProxy();
  var lostAndFound = ItemProxy.getProxyFor('LOST+FOUND');
  var a, aa, newAAItem, bb, b, ab;
  // console.log(__dirname);
  // console.log('::: Starting Item Proxy Test');
  var dumpEnabled = false;
  var _ = require('underscore');

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function resetItemRepository() {
    var rootProxy = ItemProxy.getRootProxy();

    rootProxy.children.forEach((childProxy) => {
      childProxy.deleteItem(true);
    });
    
    ItemProxy.loadingComplete();
    
    expect(rootProxy.treeHashEntry.treeHash).toEqual('4061d87643bd1c197979c24f2f7fdc013d2b71b3');
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dump(message) {
    if (dumpEnabled){
      if (message) {
         console.log('>>> ' + message);
      }

      ItemProxy.dumpAllProxies();
      // console.log('');
      root.dumpProxy();
      // console.log('Root Descendants: ' + root.descendantCount);
      // console.log('');
      lostAndFound.dumpProxy();
      console.log('-----------------------------------------');      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dumpHashFor(proxy, message) {
    if (dumpEnabled){
      console.log('::: Hash for ' + proxy.item.name);
      if (message) {
         console.log('>>> ' + message);
      }

      console.log(proxy.treeHashEntry);
      console.log('-----------------------------------------');      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function defineTestModel() {
    var modelDefMap = {
        Test: {
          'name': 'Test',
          'base': 'PersistedModel',
          'strict': 'validate',
          'idInjection': true,
          'trackChanges': false,
          'properties': {
            'id': {
              'type': 'string',
              'id': true,
              'defaultFn': 'guid'
            },
            'name': {
              'type': 'string',
              'required': true
            },
            'parentId': {
              'type': 'string',
              'default': ''
            }
          },
          'validations': [],
          'relations': {},
          'acls': [],
          'methods': []
      },
      'Test-Exclude': {
        'name': 'Test',
        'base': 'PersistedModel',
        'strict': 'validate',
        'idInjection': true,
        'trackChanges': false,
        'properties': {
          'id': {
            'type': 'string',
            'id': true,
            'defaultFn': 'guid'
          },
          'name': {
            'type': 'string',
            'required': true
          },
          'parentId': {
            'type': 'string',
            'default': ''
          }
        },
        'validations': [],
        'relations': {},
        'acls': [],
        'methods': []
      }        

    };
    
    ItemProxy.loadModelDefinitions(modelDefMap);
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function getCopyOfItem (proxy){
    return JSON.parse(JSON.stringify(proxy.item));
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Add Node Without Parent', function() {
    dump('--- Beginning state');
    expect(root).toBeDefined();
    // console.log('::: Adding node without parent');
    aa = new ItemProxy('Test', {
      id : 'aa',
      name : 'AA',
      parentId : 'a',
      uniq : 'unique'
    });
    expect(aa).toBeDefined();
    expect(aa).not.toBeNull();

    dump('Added node without parent');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Add Parent', function() {
    // console.log('::: Adding parent');
    a = new ItemProxy('Test', {
      id : 'a',
      name : 'A',
      parentId : ''
    });
    expect(a).toBeDefined();
    expect(a).not.toBeNull();
    var child = root.getChildByName('A');
    expect(child).toBeDefined();
    expect(child).not.toBeNull();
    expect(child).toBe(a);

    // Check to make sure that AA was added as a child of A
    child = a.getChildByName('AA');
    expect(child).toBeDefined();
    expect(child).not.toBeNull();
    expect(child).toBe(aa);

    dump('Added parent');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Add Bs', function() {
    // console.log('::: Adding b, bbb');
    b = new ItemProxy('Test', {
      id : 'b',
      name : 'B',
      parentId : ''
    });

    expect(b).toBeDefined();
    expect(b).not.toBeNull();
    var child = root.getChildByName('B');
    expect(child).toBeDefined();
    expect(child).not.toBeNull();
    expect(child).toBe(b);

    var bbb = new ItemProxy('Test', {
      id : 'bbb',
      name : 'BBB',
      parentId : 'bb'
    });

    var autobb = ItemProxy.getProxyFor('bb');

    expect(autobb.item.parentId).toBe('LOST+FOUND');

    dump('Added b\'s');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Adding bb', function() {
    // console.log('::: Adding bb');
    bb = new ItemProxy('Test', {
      id : 'bb',
      name : 'BB',
      parentId : 'b'
    });
    dump('Added bb');

    expect(b.children[0].item.id).toBe('bb');
    expect(b.item.id).toBe(bb.parentProxy.item.id);

  });

  it('Delete a', function() {
    // console.log('::: Deleting a');

    expect(root.children[0].item.id).toBe('a');

    a.deleteItem();
    dump('Deleted a');

    expect(root.children[0].item.id).toBe('b');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Changing parent of aa', function() {
    // console.log('::: Changing parent of aa');
    // console.log(aa.item);
    newAAItem = JSON.parse(JSON.stringify(aa.item));
    newAAItem.parentId = 'b';
    newAAItem.description = 'b with changes';
    delete newAAItem.uniq;
    // console.log(newAAItem);

    var temp = aa.item.id;

    aa.updateItem('Test', newAAItem);
    // console.log(aa.item);
    dump('Changed aa parent');

    expect(aa.item.parentId).toBe('b');
    expect(aa.item.description).toBe('b with changes');
    expect(aa.item.id).toBe(temp);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Deleting description for aa', function() {
    // console.log('::: Deleting description for aa');

    var temp = aa.item.id;

    delete newAAItem.description;
    aa.updateItem('Test', newAAItem);
    // console.log(aa.item);
    dump('Deleted aa description');

    expect(aa.item.description).toBe(undefined);
    expect(aa.item.id).toBe(temp);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Changing parent of bb to ROOT', function() {
    // console.log('::: Changing parent of bb to ROOT');
    var newBBItem = JSON.parse(JSON.stringify(bb.item));
    newBBItem.parentId = '';
    bb.updateItem('Test', newBBItem);
    dump('Changed bb parent to ROOT');

    expect(bb.item.parentId).toBe('');
    expect(bb.parentProxy).toBe(root);
    expect(root.getChildByName('BB')).toBe(bb);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Changing parent of bb to c', function() {
    // console.log('::: Changing parent of bb to c');
    var newBBItem = JSON.parse(JSON.stringify(bb.item));
    newBBItem.parentId = 'c';
    bb.updateItem('Test', newBBItem);
    dump('Changed bb parent to c');

    var c = ItemProxy.getProxyFor('c');
    expect(bb.item.parentId).toBe('c');
    expect(bb.parentProxy).toBe(c);
    expect(c.getChildByName('BB')).toBe(bb);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Morph b into a NewTest', function() {
    // console.log('::: Morph b into a NewTest');
    var newBItem = JSON.parse(JSON.stringify(b.item));
    b.updateItem('NewTest', newBItem);
    dump('Change b to a NewTest kind');

    expect(b.kind).toBe('NewTest');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Renaming an item', function() {
    // console.log('::: Preparing to rename an item');
    var ab = new ItemProxy('Test', {
      id : 'ab',
      name : 'AB',
      parentId : 'b'
    });
    var ac = new ItemProxy('Test', {
      id : 'ac',
      name : 'AC',
      parentId : 'b'
    });
    var ad = new ItemProxy('Test', {
      id : 'ad',
      name : 'AD',
      parentId : 'b'
    });
    var ae = new ItemProxy('Test', {
      id : 'ae',
      name : 'AE',
      parentId : 'b'
    });
    dump('Created AB - AE');

    var expectArray = JSON.stringify([ 'aa', 'ab', 'ac', 'ad', 'ae' ]);
    function getChildIds(item) {
      var temp = [];
      for (var i = 0; i < item.children.length; i++) {
        temp.push(item.children[i].item.id);
      }
      return JSON.stringify(temp);
    }

    expect(getChildIds(b)).toBe(expectArray);

    var newAEItem = JSON.parse(JSON.stringify(ae.item));
    newAEItem.name = 'A - New Name - AE';
    ae.updateItem('Item', newAEItem);
    dump('AE Name Updated');

    expectArray = JSON.stringify([ 'ae', 'aa', 'ab', 'ac', 'ad' ]);
    expect(getChildIds(b)).toBe(expectArray);

    var newABItem = JSON.parse(JSON.stringify(ab.item));
    newABItem.name = 'New Name - AB';
    ab.updateItem('Item', newABItem);
    dump('AB Name Updated');

    expectArray = JSON.stringify([ 'ae', 'aa', 'ac', 'ad', 'ab' ]);
    expect(getChildIds(b)).toBe(expectArray);

    var newAAItem = JSON.parse(JSON.stringify(aa.item));
    newAAItem.name = 'B - New Name - AA';
    aa.updateItem('Item', newAAItem);
    dump('AA Name Updated');

    expectArray = JSON.stringify([ 'ae', 'ac', 'ad', 'aa', 'ab' ]);
    expect(getChildIds(b)).toBe(expectArray);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Renaming an ordered item', function() {
    // console.log('::: Preparing to rename an ordered item');
    // console.log('::: Adding d - de');
    var d = new ItemProxy('Test', {
      id : 'd',
      name : 'D',
      parentId : '',
      itemIds : [ 'da', 'db', 'dc', 'dd', 'de' ]
    });
    var dab = new ItemProxy('Test', {
      id : 'dab',
      name : 'DAB',
      parentId : 'd'
    });
    var da = new ItemProxy('Test', {
      id : 'da',
      name : 'DA',
      parentId : 'd'
    });
    var db = new ItemProxy('Test', {
      id : 'db',
      name : 'DB',
      parentId : 'd'
    });
    var dc = new ItemProxy('Test', {
      id : 'dc',
      name : 'DC',
      parentId : 'd'
    });
    var dd = new ItemProxy('Test', {
      id : 'dd',
      name : 'DD',
      parentId : 'd'
    });
    var de = new ItemProxy('Test', {
      id : 'de',
      name : 'DE',
      parentId : 'd'
    });
    dump('Created D - DE');

    var expectArray = JSON.stringify([ 'da', 'db', 'dc', 'dd', 'de', 'dab' ]);
    
    function getChildIds(proxy) {
      return JSON.stringify(proxy.getOrderedChildIds());
    }

    expect(getChildIds(d)).toBe(expectArray);

    var newDEItem = JSON.parse(JSON.stringify(de.item));
    newDEItem.name = 'A - New Name - DE';
    de.updateItem('Test', newDEItem);
    dump('DE Name Updated');
    expect(getChildIds(d)).toBe(expectArray);

    var newDBItem = JSON.parse(JSON.stringify(db.item));
    newDBItem.name = 'New Name - DB';
    db.updateItem('Test', newDBItem);
    dump('DB Name Updated');
    expect(getChildIds(d)).toBe(expectArray);

    var newDAItem = JSON.parse(JSON.stringify(da.item));
    newDAItem.name = 'B - New Name - DA';
    da.updateItem('Test', newDAItem);
    dump('DA Name Updated');
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'da', 'db', 'dd', 'de', 'dab' ]);
    dc.deleteItem();
    dump('Deleted dc');
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'da', 'db', 'dd', 'de', 'daa', 'dab', 'dac' ]);
    dump('Adding daa and dac');
    var dac = new ItemProxy('Test', {
      id : 'dac',
      name : 'DAC',
      parentId : 'd'
    });
    var daa = new ItemProxy('Test', {
      id : 'daa',
      name : 'DAA',
      parentId : 'd'
    });
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'da', 'dd', 'db', 'de', 'daa', 'dab', 'dac' ]);
    var newDItem = JSON.parse(JSON.stringify(d.item));
    newDItem.itemIds = [ 'da', 'dd', 'db', 'de' ];
    d.updateItem('Test', newDItem);
    dump('Moved db and dd');
    expect(getChildIds(d)).toBe(expectArray);
    
    expectArray = JSON.stringify([ 'dab', 'de', 'dd', 'db', 'da', 'daa', 'dac' ]);
    d.deleteItem();
    d = new ItemProxy('Test', {
      id : 'd',
      name : 'D',
      parentId : '',
      itemIds : [ 'dab', 'de', 'dd', 'db', 'da' ]
    });
    dump('Added d');
    expect(getChildIds(d)).toBe(expectArray);
    
    expectArray = JSON.stringify([ 'dab', 'de', 'dd', 'db', 'da', 'da1', 'daa', 'dac', 'dz1', 'dz2', 'dz3' ]);
    var da1 = new ItemProxy('Test', {
      id : 'da1',
      name : 'DA1',
      parentId : 'd'
    });
    var dz1 = new ItemProxy('Test', {
      id : 'dz1',
      name : 'DZ1',
      parentId : 'd'
    });
    var dz2 = new ItemProxy('Test', {
      id : 'dz2',
      name : 'DZ2',
      parentId : 'd'
    });
    var dz3 = new ItemProxy('Test', {
      id : 'dz3',
      name : 'DZ3',
      parentId : 'd'
    });
    dump('Added da1, dz1-dz2');
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'de', 'da', 'da1', 'daa', 'dab', 'dac', 'dd', 'dz1', 'dz2', 'dz3', 'db' ]);
    newDItem = JSON.parse(JSON.stringify(d.item));
    newDItem.itemIds = [];
    d.updateItem('Test', newDItem);
    dump('Removed itemIds');
    expect(getChildIds(d)).toBe(expectArray);
    
    expectArray = JSON.stringify([ 'dac', 'da', 'daa', 'dab', 'de', 'dd', 'dz1', 'dz2', 'db', 'da1', 'dz3' ]);
    newDItem = JSON.parse(JSON.stringify(d.item));
    newDItem.itemIds = [ 'dac', 'da', 'daa', 'dab', 'de', 'dd', 'dz1', 'dz2', 'db' ];
    d.updateItem('Test', newDItem);
    dump('Added itemIds');
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify(['de', 'da', 'da1', 'daa', 'dab', 'dac', 'dd', 'dz1', 'dz2', 'dz3', 'db']);
    d.makeChildrenAutoOrdered();
    dump('Auto Ordered');
    expect(getChildIds(d)).toBe(expectArray);
    expect(d.item.itemIds.length).toBe(0);


    expectArray = JSON.stringify(['de', 'da', 'da1', 'daa', 'dab', 'dac', 'dd', 'dn', 'dz1', 'dz2', 'dz3', 'db']);
    var dn = new ItemProxy('Test', {
      id : 'dn',
      name : 'DN',
      parentId : 'd'
    });
    dump('Added DN to Auto List');
    expect(getChildIds(d)).toBe(expectArray);



    d.makeChildrenManualOrdered();
    dump('Manual Ordered');
    expect(getChildIds(d)).toBe(expectArray);
    expect(d.item.itemIds.length).toBe(12);


  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Get Ancestors', function() {
    // console.log('::: Getting AB ancestors');
    var ab = ItemProxy.getProxyFor('ab');
    var abAncestors = ab.getAncestorProxies();
    var expected = [ 'b', 'ROOT' ];
    for ( var ancestorIdx in abAncestors) {
      var ancestor = abAncestors[ancestorIdx];
      // console.log(ancestor.item.id + ' - ' + ancestor.item.name);

      expect(ancestor.item.id).toBe(expected[ancestorIdx]);
    }    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Get Descendants', function() {
    // console.log('::: Getting B Descendants');
    var b = ItemProxy.getProxyFor('b');
    var ac1 = new ItemProxy('Test', {
      id: 'ac1',
      name: 'AC1',
      parentId: 'ac'
    });
    var bDescendants = b.getDescendants();
    var expectedIds =  [ 'ae', 'ac', 'ac1', 'ad', 'aa', 'ab' ];
    
    var bDescendantIds = [];
    bDescendants.forEach((proxy) => {
      bDescendantIds.push(proxy.item.id);
    });
    
    expect(bDescendantIds).toEqual(expectedIds);
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  xit('Should Remove All Items From Repository', ()=> {
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Hash Before Item Loaded Creates Tree Hash On Internal Node', ()=> {

    var item = {
      id:'test-item-id',
      name: 'TestItem ',
      parentId: 'Not_A_Valid_Parent_Id'
    };
    var proxy = new ItemProxy('Test', item);

    dumpHashFor(proxy.parentProxy);
    dumpHashFor(proxy);
    ItemProxy.loadingComplete();

    expect(proxy.parentProxy.treeHashEntry.treeHash).toEqual('61a57146a9fa2422b0940680c7449a42db3b71ab');
    expect(proxy.parentProxy.treeHashEntry.childTreeHashes['test-item-id'])
      .toEqual('53688a4a9207203c25da692d634bd58305ae1313');
    expect(proxy.treeHashEntry.treeHash).toEqual('53688a4a9207203c25da692d634bd58305ae1313');
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Calculates OID and TreeHash For a Leaf Node', ()=> {
    
    var thProxy = new ItemProxy('Test', {
      id : 'TH-Node-A',
      name : 'Node A',
      parentId : ''
    });
    console.log('::: Node A');
    console.log(thProxy.treeHashEntry);
    expect(thProxy.treeHashEntry.treeHash).toBe('c821eb4089f0a835ab941c9b0db64f2ad32b44c7');
    
    console.log('::: Update Node');
    var copyOfItem = getCopyOfItem(thProxy);
    var itemToModify = getCopyOfItem(thProxy);
    
    itemToModify.name = 'Node A Updated';
    thProxy.updateItem('Test', itemToModify);
    console.log(thProxy.treeHashEntry);
    expect(thProxy.treeHashEntry.treeHash).toBe('2719d45fee33b0f3dbd72135fb57283b87bb321b');

    
    console.log('::: Putting back to same item');
    thProxy.updateItem('Test', copyOfItem);
    console.log(thProxy.treeHashEntry);
    expect(thProxy.treeHashEntry.treeHash).toBe('c821eb4089f0a835ab941c9b0db64f2ad32b44c7');
    
    console.log('===');
    console.log(thProxy.document());
    console.log('===');
    
    expect(thProxy.treeHashEntry.oid).toBe('96f356b031940440afda4aab888a66753a3dcf47');
    expect(thProxy.treeHashEntry.treeHash).toBe('c821eb4089f0a835ab941c9b0db64f2ad32b44c7');

  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Isolates Repositories in Tree Hash', ()=> {
    var repoA = new ItemProxy('Repository', {
      name: 'Repository A',
      id: 'AAAA-AAAA'
    });
    
    var a1 = new ItemProxy('Test', {
      name: 'Item A1',
      id: 'AAAA-1111',
      parentId: 'AAAA-AAAA'      
    });
    
    var repoB = new ItemProxy('Repository', {
      name: 'Repository B',
      id: 'BBBB-BBBB',
      parentId: 'AAAA-AAAA'
    });
    
    const expectedRepoAChildHashes = {
        'AAAA-1111': '32e9a0cf54ff2a87304865fe3b99723dac910278',
        'BBBB-BBBB': 'Repository-Mount'
    };

    const expectedInitialRepoBChildHashes = {};

    const expectedFinalRepoBChildHashes = {
        'BBBB-1111' : '7b1715172e8c5491ef5265adf78695d7ef9cb9ad'
    };
    
    dumpHashFor(repoA, 'Isolated Nested Repositories');
    dumpHashFor(a1);
    dumpHashFor(repoB);
    expect(repoA.treeHashEntry.childTreeHashes).toEqual(expectedRepoAChildHashes);
    expect(repoA.treeHashEntry.treeHash).toEqual('f8730b5510c1d47c3082836728336cd4a68f34d5');
    expect(repoB.treeHashEntry.childTreeHashes).toEqual(expectedInitialRepoBChildHashes);
    
    var b1 = new ItemProxy('Test', {
      name: 'Item B1',
      id: 'BBBB-1111',
      parentId: 'BBBB-BBBB'      
    });

    dumpHashFor(repoA, 'Added Item in Repo B, should not affect Repo A');
    dumpHashFor(a1);
    dumpHashFor(repoB);
    // Only Repo B should have been affected
    expect(repoA.treeHashEntry.childTreeHashes).toEqual(expectedRepoAChildHashes);
    expect(repoA.treeHashEntry.treeHash).toEqual('f8730b5510c1d47c3082836728336cd4a68f34d5');
    expect(repoB.treeHashEntry.childTreeHashes).toEqual(expectedFinalRepoBChildHashes);
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  xit('Writes a File', ()=>{
    var jsonObject = {
      name: 'Some Content',
      id: 'Some File'
    };
    var fs = require('fs');
    
    console.log('::: Writing the file');
    fs.writeFileSync('w.out', JSON.stringify(jsonObject, null, '  '), {encoding: 'utf8', flag: 'w'});      
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Should Ensure Fields Are In Consistent Order', ()=>{

    defineTestModel();
    
    var object1a = {
        name: 'Some Content',
        id: 'id-1a1a1a'        
    };
    
    var object1b = {
        id: 'id_1a1a1a',
        name: 'Some Content'
    };
    
    var obj1a = new ItemProxy('Test', object1a);

    expect(Object.keys(obj1a.item)).toEqual([ 'id', 'name' ]);
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Should Load Class Model Definitions', ()=>{
    resetItemRepository();

    var fs = require('fs');
    var modelDefData = fs.readFileSync('./kdb/modelDef.json', {encoding: 'utf8', flag: 'r'});
    var modelDefMap = JSON.parse(modelDefData);
   
    ItemProxy.loadModelDefinitions(modelDefMap);
    ItemProxy.loadingComplete();
    
    var rootProxy = ItemProxy.getRootProxy();
    var modelDefProxy = ItemProxy.getProxyFor('Model-Definitions');
    
    expect(rootProxy.treeHashEntry.childTreeHashes['Model-Definitions'])
      .toEqual(modelDefProxy.treeHashEntry.treeHash);
    
    var requiredFields = {};
    modelDefProxy.visitChildren(null, (proxy) => {
      requiredFields[proxy.item.name] = proxy.item.requiredProperties;
    });
    
    var expectedRequiredFields = { 
        Analysis : [ 'id' ],
        Item : [ 'name' ],
        Category : [ 'name' ],
        Decision : [ 'name', 'decisionState' ],
        Action : [ 'name', 'decisionState', 'actionState' ],
        KoheseModel : [ 'name', 'idInjection', 'properties', 'validations', 'relations', 'acls', 'methods' ],
        KoheseUser : [ 'name', 'password' ],
        Observation : [ 'name', 'observedBy', 'observedOn', 'context' ],
        Issue : [ 'name', 'observedBy', 'observedOn', 'context', 'issueState' ],
        Repository : [ 'name' ],
        Task : [ 'name', 'taskState' ] };

    expect(requiredFields).toEqual(expectedRequiredFields);
    
    
    var newItem = new ItemProxy('Item', {
      id: 'new-item',
      description: 'Missing Name'
    });
    
    var itemValidation = newItem.validateItem();
    expect(itemValidation).toEqual({
      valid: false,
      missingProperties: [ 'name']
    });
    
    newItem.item.name = "Test";
    itemValidation = newItem.validateItem();
    expect(itemValidation.valid).toEqual(true);
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('should do depth first visit', () =>{

    resetItemRepository();
    
    defineTestModel();
    
    function createNV(nodeId, parentId, kind){
      var createKind = kind || 'Test';
      var proxy = new ItemProxy(createKind,{
        id: nodeId,
        name: 'Node Visitor ' + nodeId,
        parentId: parentId
      });
    }
      
    var topProxy = new ItemProxy('Test', {
      id : 'NV-TOP',
      name: 'NV Top'
    });

    createNV('A', 'NV-TOP');
    createNV('AA', 'A');
    createNV('AB', 'A', 'Test-Exclude');
    createNV('ABA', 'AB');
    createNV('ABB', 'AB');
    createNV('AC', 'A');
    createNV('B', 'NV-TOP');
    createNV('C', 'NV-TOP');

    var order = [];
    
    function before(proxy){
      order.push('Before ' + proxy.item.id);
    }
    
    function after(proxy){
      order.push('After ' + proxy.item.id);
    }
    
    // Breadth First (Top Down)
    order = [];
    topProxy.visitTree(null, before, null);
    expect(order).toEqual(
        [ 'Before NV-TOP', 'Before A', 'Before AA', 'Before AB', 'Before ABA', 'Before ABB',
          'Before AC', 'Before B', 'Before C' ]);

    // Depth First (Bottom Up)
    order = [];
    topProxy.visitTree(null, null, after);
    expect(order).toEqual(
        [ 'After AA', 'After ABA', 'After ABB', 'After AB', 'After AC', 'After A', 'After B',
          'After C', 'After NV-TOP' ]);
    
    // Wrap Visit (Before and After)
    order = [];
    topProxy.visitTree(null, before, after);
    expect(order).toEqual(
        [ 'Before NV-TOP', 'Before A', 'Before AA', 'After AA', 'Before AB', 'Before ABA',
          'After ABA', 'Before ABB', 'After ABB', 'After AB', 'Before AC', 'After AC', 'After A',
          'Before B', 'After B', 'Before C', 'After C', 'After NV-TOP' ]);
    
    // Wrap Children
    order = [];
    topProxy.visitChildren(null, before, after);
    expect(order).toEqual(
        [ 'Before A', 'Before AA', 'After AA', 'Before AB', 'Before ABA', 'After ABA', 'Before ABB',
          'After ABB', 'After AB', 'Before AC', 'After AC', 'After A', 'Before B', 'After B', 'Before C',
          'After C' ]);
    
    // Exclude Sub-Tree
    order = [];
    topProxy.visitTree({excludeKind: ['Test-Exclude']}, before, after);
    expect(order).toEqual(
        [ 'Before NV-TOP', 'Before A', 'Before AA', 'After AA', 'Before AC', 'After AC', 'After A',
          'Before B', 'After B', 'Before C', 'After C', 'After NV-TOP' ]);
    
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Retrieve Tree Hash Map', ()=> {

    var treeHashMap = ItemProxy.getAllTreeHashes();
    var expectedTreeHashMap = { 
        ROOT: 
        { kind: 'Internal',
          oid: 'ba14baabb49cca43770ca92b36388169a2df5f6c',
          childTreeHashes: 
           { 'Model-Definitions': 'cb3e15f88d4c8bed83ca40121c69a175b806dd50',
             'NV-TOP': 'f914e46f91190f7a8d48c9325bf78b5ebca8f8d8' },
          treeHash: '19dadbbb0c550bd2a56a539ce04a41fbf990ab1b' },
       'Model-Definitions': 
        { kind: 'Internal-Model',
          oid: '8109f6a5dfeea6ede032fa99d6cd1b79ef589503',
          childTreeHashes: 
           { Test: '4b86b0ffd2d8ee9507751331c5c74c1439e3a8c6',
             'Test-Exclude': '9a5257c8fc7ca9d5dd6d4fd63325a04e2ff99e04' },
          treeHash: 'cb3e15f88d4c8bed83ca40121c69a175b806dd50' },
       Test: 
        { kind: 'Internal-Model',
          oid: 'b7d79d44bb83cdc33e0fe85b419d6a4227388ce0',
          childTreeHashes: {},
          treeHash: '4b86b0ffd2d8ee9507751331c5c74c1439e3a8c6',
          parentId: 'Model-Definitions' },
       'Test-Exclude': 
        { kind: 'Internal-Model',
          oid: '32baf8d7286b920653652c5150d5b94a9a566dab',
          childTreeHashes: {},
          treeHash: '9a5257c8fc7ca9d5dd6d4fd63325a04e2ff99e04',
          parentId: 'Model-Definitions' },
       'NV-TOP': 
        { kind: 'Test',
          oid: '69631d8cdb357d06c2a3bb8a71bf5f96f941ab08',
          childTreeHashes: 
           { A: 'a9385f1c99e1df0b5fac84cf27c3697a81bd677e',
             B: 'e57da6530dffc225601f4b58b6dd839aae6bca3d',
             C: 'ae18d558a36067d6fc77346a22b2ebd64a1c7e5e' },
          treeHash: 'f914e46f91190f7a8d48c9325bf78b5ebca8f8d8' },
       A: 
        { kind: 'Test',
          oid: '239ac47533ede73b9896ba578fdd0a775fd6297e',
          childTreeHashes: 
           { AA: '38d2301582967345cc6c30e5df19359b757db4fb',
             AB: '9eb9d8f149c52b7b171a55a1ad2cf19e6ebd5722',
             AC: '1d76e2c4dbb6a464995ad802525021924c768088' },
          treeHash: 'a9385f1c99e1df0b5fac84cf27c3697a81bd677e',
          parentId: 'NV-TOP' },
       AA: 
        { kind: 'Test',
          oid: '71cea569a1401108ea4ce2ebe40470ba536fc676',
          childTreeHashes: {},
          treeHash: '38d2301582967345cc6c30e5df19359b757db4fb',
          parentId: 'A' },
       AB: 
        { kind: 'Test-Exclude',
          oid: 'aa9fa4c32ae23738be8c847304d5fccbc7823116',
          childTreeHashes: 
           { ABA: '3182f87ce6dc32b512c7ac2b3bec95577a670b49',
             ABB: 'bc3f80b453f282d816d0450a16af385eb2fdcd8f' },
          treeHash: '9eb9d8f149c52b7b171a55a1ad2cf19e6ebd5722',
          parentId: 'A' },
       ABA: 
        { kind: 'Test',
          oid: '2968d55c37fe84f64ad74e70f2522e51af9a7033',
          childTreeHashes: {},
          treeHash: '3182f87ce6dc32b512c7ac2b3bec95577a670b49',
          parentId: 'AB' },
       ABB: 
        { kind: 'Test',
          oid: 'f664223cc5efe2320d22ec1692aa8b8de9b4fb90',
          childTreeHashes: {},
          treeHash: 'bc3f80b453f282d816d0450a16af385eb2fdcd8f',
          parentId: 'AB' },
       AC: 
        { kind: 'Test',
          oid: '6f67f295d6a2365bb4cd32469471091402d310dd',
          childTreeHashes: {},
          treeHash: '1d76e2c4dbb6a464995ad802525021924c768088',
          parentId: 'A' },
       B: 
        { kind: 'Test',
          oid: '5c69c898222c3219089be690b63e418f09e93799',
          childTreeHashes: {},
          treeHash: 'e57da6530dffc225601f4b58b6dd839aae6bca3d',
          parentId: 'NV-TOP' },
       C: 
        { kind: 'Test',
          oid: '3cfa883acec0a529b941b02a57f4187bece8263d',
          childTreeHashes: {},
          treeHash: 'ae18d558a36067d6fc77346a22b2ebd64a1c7e5e',
          parentId: 'NV-TOP' }
    };
    
    var thmCompare = ItemProxy.compareTreeHashMap(expectedTreeHashMap, treeHashMap);
    if (!thmCompare.match){
      console.log('Tree Map');
      console.log(treeHashMap);
      console.log('Tree Hash Map Compare');
      console.log(thmCompare);
    }
    
    expect(treeHashMap).toEqual(expectedTreeHashMap);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Retrieve Delta Tree Hash Map', ()=> {

    var treeHashMapBefore = ItemProxy.getAllTreeHashes();

    // Delete B
    var b = ItemProxy.getProxyFor('B');
    b.deleteItem();
    
    // Update C
    var c = ItemProxy.getProxyFor('C');
    var newCItem = JSON.parse(JSON.stringify(c.item));
    newCItem.name = 'Updated C';
    c.updateItem(c.kind, newCItem);
   
    // Add D
    var d = new ItemProxy('Test', {
      id: 'D',
      name: 'Node Visitor D',
      parentId: 'NV-TOP'
    });
    
    var expectedDeltaMap = {
        match : false, 
        addedItems : [ 'D' ], 
        changedItems : [ 'C' ], 
        deletedItems : [ 'B' ], 
        addedChildren : [  ],
        changedChildren : [  ],
        deletedChildren : [  ],
        undefinedFromItems : [  ],
        undefinedToItems : [  ]
    };

    var treeHashMapAfter = ItemProxy.getAllTreeHashes();
    
    var thmCompare = ItemProxy.compareTreeHashMap(treeHashMapBefore, treeHashMapAfter);
    
    expect(thmCompare).toEqual(expectedDeltaMap);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Should Not Hang When Deleting Lost+Found With Children', ()=> {

    resetItemRepository();
    defineTestModel();
    
    var a = new ItemProxy('Test', {
      id: 'A',
      name: 'A Item'
    });
    
    var bb = new ItemProxy('Test', {
      id: 'BB',
      name: 'BB Item',
      parentId: 'B'
    });

    // Try to delete item only
    var lfProxy = ItemProxy.getProxyFor('LOST+FOUND');
    lfProxy.deleteItem();
 
    // Try to delete item and descendants
    var lfProxyAfter = ItemProxy.getProxyFor('LOST+FOUND');
    expect(lfProxyAfter).toEqual(lostAndFound);
    expect(lfProxyAfter.descendantCount).toEqual(2);

    lostAndFound.deleteItem(true);
    expect(lfProxyAfter.descendantCount).toEqual(0);    
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Update Tree Hash When Creating Already Existing Item', ()=> {

    resetItemRepository();
    defineTestModel();
    
    var a = new ItemProxy('Test', {
      id: 'A',
      name: 'A Item'
    });
    var aa = new ItemProxy('Test', {
      id: 'AA',
      name: 'AA Item',
      parentId: 'A'
    });
    var ab = new ItemProxy('Test', {
      id: 'AB',
      name: 'AA Item',
      parentId: 'A'
    });
    
    var newAA = new ItemProxy('Test', {
      id: 'AA',
      name: 'Updated AA Item',
      parentId: 'A'
    });
    
    var expectedATreeHashEntry = {
        kind: 'Test',
        oid: '167cc8efd041e787a28a392144edaea329ddc8ca',
        childTreeHashes: 
         { AB: '90f7ce824ded7365abe31d7ab084837d205a4ff0',
           AA: 'b19335d15534a0f103ee74de78ad6d9be9189eeb' },
        treeHash: '377eb414c090b204428ab610f75ebbc99bae7d20'
    };
    
    expect(a.treeHashEntry).toEqual(expectedATreeHashEntry);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Prevent Recursion on Updating Lost+Found', ()=> {

    resetItemRepository();
    defineTestModel();
    
    var a = new ItemProxy('Test', {
      id: 'A',
      name: 'A Item',
      parentId: 'MISSING'
    });
    
    var lfContent = _.clone(lostAndFound.item);
    
    var lf = new ItemProxy('Internal', lfContent);
    
    expect(lostAndFound.descendantCount).toEqual(2);
  });

});