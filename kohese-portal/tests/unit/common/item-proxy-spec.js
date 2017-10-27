describe("ItemProxy Test", function() {

  var ItemProxy = require('../../../common/models/item-proxy.js');
  var root = ItemProxy.getRootProxy();
  var lostAndFound = ItemProxy.getProxyFor("LOST+FOUND");
  var a, aa, newAAItem, bb, b, ab;
  // console.log(__dirname);
  // console.log("::: Starting Item Proxy Test");
  var dumpEnabled = false;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dump(message) {
    if (dumpEnabled){
      if (message) {
         console.log(">>> " + message);
      }

      ItemProxy.dumpAllProxies();
      // console.log("");
      root.dumpProxy();
      // console.log("Root Descendants: " + root.descendantCount);
      // console.log("");
      lostAndFound.dumpProxy();
      console.log("-----------------------------------------");      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dumpHashFor(proxy, message) {
    if (dumpEnabled){
      console.log("::: Hash for " + proxy.item.name)
      if (message) {
         console.log(">>> " + message);
      }

      console.log(proxy.treeHashEntry);
      console.log("-----------------------------------------");      
    }
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
  it("Add Node Without Parent", function() {
    dump('--- Beginning state');
    expect(root).toBeDefined();
    // console.log("::: Adding node without parent");
    aa = new ItemProxy("Test", {
      id : "aa",
      name : "AA",
      parentId : "a",
      uniq : "unique"
    });
    expect(aa).toBeDefined();
    expect(aa).not.toBeNull();

    dump("Added node without parent");
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Add Parent", function() {
    // console.log("::: Adding parent");
    a = new ItemProxy("Test", {
      id : "a",
      name : "A",
      parentId : ""
    });
    expect(a).toBeDefined();
    expect(a).not.toBeNull();
    child = root.getChildByName('A');
    expect(child).toBeDefined();
    expect(child).not.toBeNull();
    expect(child).toBe(a);

    // Check to make sure that AA was added as a child of A
    child = a.getChildByName('AA');
    expect(child).toBeDefined();
    expect(child).not.toBeNull();
    expect(child).toBe(aa);

    dump("Added parent");
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Add Bs", function() {
    // console.log("::: Adding b, bbb");
    b = new ItemProxy("Test", {
      id : "b",
      name : "B",
      parentId : ""
    });

    expect(b).toBeDefined();
    expect(b).not.toBeNull();
    child = root.getChildByName('B');
    expect(child).toBeDefined();
    expect(child).not.toBeNull();
    expect(child).toBe(b);

    var bbb = new ItemProxy("Test", {
      id : "bbb",
      name : "BBB",
      parentId : "bb"
    });

    var autobb = ItemProxy.getProxyFor('bb');

    expect(autobb.item.parentId).toBe('LOST+FOUND');

    dump("Added b's");
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Adding bb", function() {
    // console.log("::: Adding bb");
    bb = new ItemProxy("Test", {
      id : "bb",
      name : "BB",
      parentId : "b"
    });
    dump("Added bb");

    expect(b.children[0].item.id).toBe('bb');
    expect(b.item.id).toBe(bb.parentProxy.item.id);

  });

  it("Delete a", function() {
    // console.log("::: Deleting a");

    expect(root.children[0].item.id).toBe('a');

    a.deleteItem();
    dump("Deleted a");

    expect(root.children[0].item.id).toBe('b');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Changing parent of aa", function() {
    // console.log("::: Changing parent of aa");
    // console.log(aa.item);
    newAAItem = JSON.parse(JSON.stringify(aa.item));
    newAAItem.parentId = "b";
    newAAItem.description = "b with changes";
    delete newAAItem.uniq;
    // console.log(newAAItem);

    var temp = aa.item.id;

    aa.updateItem("Test", newAAItem);
    // console.log(aa.item);
    dump("Changed aa parent");

    expect(aa.item.parentId).toBe('b');
    expect(aa.item.description).toBe('b with changes');
    expect(aa.item.id).toBe(temp);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Deleting description for aa", function() {
    // console.log("::: Deleting description for aa");

    var temp = aa.item.id;

    delete newAAItem.description;
    aa.updateItem("Test", newAAItem);
    // console.log(aa.item);
    dump("Deleted aa description");

    expect(aa.item.description).toBe(undefined);
    expect(aa.item.id).toBe(temp);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Changing parent of bb to ROOT", function() {
    // console.log("::: Changing parent of bb to ROOT");
    var newBBItem = JSON.parse(JSON.stringify(bb.item));
    newBBItem.parentId = "";
    bb.updateItem("Test", newBBItem);
    dump("Changed bb parent to ROOT");

    expect(bb.item.parentId).toBe('');
    expect(bb.parentProxy).toBe(root);
    expect(root.getChildByName('BB')).toBe(bb);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Changing parent of bb to c", function() {
    // console.log("::: Changing parent of bb to c");
    var newBBItem = JSON.parse(JSON.stringify(bb.item));
    newBBItem.parentId = "c";
    bb.updateItem("Test", newBBItem);
    dump("Changed bb parent to c");

    var c = ItemProxy.getProxyFor('c');
    expect(bb.item.parentId).toBe('c');
    expect(bb.parentProxy).toBe(c);
    expect(c.getChildByName('BB')).toBe(bb);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Morph b into a NewTest", function() {
    // console.log("::: Morph b into a NewTest");
    var newBItem = JSON.parse(JSON.stringify(b.item));
    b.updateItem("NewTest", newBItem);
    dump("Change b to a NewTest kind");

    expect(b.kind).toBe('NewTest');
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Renaming an item", function() {
    // console.log("::: Preparing to rename an item");
    var ab = new ItemProxy("Test", {
      id : "ab",
      name : "AB",
      parentId : "b"
    });
    var ac = new ItemProxy("Test", {
      id : "ac",
      name : "AC",
      parentId : "b"
    });
    var ad = new ItemProxy("Test", {
      id : "ad",
      name : "AD",
      parentId : "b"
    });
    var ae = new ItemProxy("Test", {
      id : "ae",
      name : "AE",
      parentId : "b"
    });
    dump("Created AB - AE");

    var expectArray = JSON.stringify([ 'aa', 'ab', 'ac', 'ad', 'ae' ]);
    function getChildIds(item) {
      var temp = [];
      for (var i = 0; i < item.children.length; i++) {
        temp.push(item.children[i].item.id);
      }
      return JSON.stringify(temp);
    }
    ;

    expect(getChildIds(b)).toBe(expectArray);

    var newAEItem = JSON.parse(JSON.stringify(ae.item));
    newAEItem.name = "A - New Name - AE";
    ae.updateItem("Item", newAEItem);
    dump("AE Name Updated")

    expectArray = JSON.stringify([ 'ae', 'aa', 'ab', 'ac', 'ad' ]);
    expect(getChildIds(b)).toBe(expectArray);

    var newABItem = JSON.parse(JSON.stringify(ab.item));
    newABItem.name = "New Name - AB";
    ab.updateItem("Item", newABItem);
    dump("AB Name Updated")

    expectArray = JSON.stringify([ 'ae', 'aa', 'ac', 'ad', 'ab' ]);
    expect(getChildIds(b)).toBe(expectArray);

    var newAAItem = JSON.parse(JSON.stringify(aa.item));
    newAAItem.name = "B - New Name - AA";
    aa.updateItem("Item", newAAItem);
    dump("AA Name Updated")

    expectArray = JSON.stringify([ 'ae', 'ac', 'ad', 'aa', 'ab' ]);
    expect(getChildIds(b)).toBe(expectArray);
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Renaming an ordered item", function() {
    // console.log("::: Preparing to rename an ordered item");
    // console.log("::: Adding d - de");
    d = new ItemProxy("Test", {
      id : "d",
      name : "D",
      parentId : "",
      itemIds : [ 'da', 'db', 'dc', 'dd', 'de' ]
    });
    var dab = new ItemProxy("Test", {
      id : "dab",
      name : "DAB",
      parentId : "d"
    });
    var da = new ItemProxy("Test", {
      id : "da",
      name : "DA",
      parentId : "d"
    });
    var db = new ItemProxy("Test", {
      id : "db",
      name : "DB",
      parentId : "d"
    });
    var dc = new ItemProxy("Test", {
      id : "dc",
      name : "DC",
      parentId : "d"
    });
    var dd = new ItemProxy("Test", {
      id : "dd",
      name : "DD",
      parentId : "d"
    });
    var de = new ItemProxy("Test", {
      id : "de",
      name : "DE",
      parentId : "d"
    });
    dump("Created D - DE");

    var expectArray = JSON.stringify([ 'da', 'db', 'dc', 'dd', 'de', 'dab' ]);
    
    function getChildIds(proxy) {
      return JSON.stringify(proxy.getOrderedChildIds());
    };

    expect(getChildIds(d)).toBe(expectArray);

    var newDEItem = JSON.parse(JSON.stringify(de.item));
    newDEItem.name = "A - New Name - DE";
    de.updateItem("Test", newDEItem);
    dump("DE Name Updated")
    expect(getChildIds(d)).toBe(expectArray);

    var newDBItem = JSON.parse(JSON.stringify(db.item));
    newDBItem.name = "New Name - DB";
    db.updateItem("Test", newDBItem);
    dump("DB Name Updated")
    expect(getChildIds(d)).toBe(expectArray);

    var newDAItem = JSON.parse(JSON.stringify(da.item));
    newDAItem.name = "B - New Name - DA";
    da.updateItem("Test", newDAItem);
    dump("DA Name Updated")
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'da', 'db', 'dd', 'de', 'dab' ]);
    dc.deleteItem();
    dump("Deleted dc");
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'da', 'db', 'dd', 'de', 'daa', 'dab', 'dac' ]);
    dump("Adding daa and dac");
    var dac = new ItemProxy("Test", {
      id : "dac",
      name : "DAC",
      parentId : "d"
    });
    var daa = new ItemProxy("Test", {
      id : "daa",
      name : "DAA",
      parentId : "d"
    });
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'da', 'dd', 'db', 'de', 'daa', 'dab', 'dac' ]);
    var newDItem = JSON.parse(JSON.stringify(d.item));
    newDItem.itemIds = [ 'da', 'dd', 'db', 'de' ];
    d.updateItem("Test", newDItem);
    dump("Moved db and dd");
    expect(getChildIds(d)).toBe(expectArray);
    
    expectArray = JSON.stringify([ 'dab', 'de', 'dd', 'db', 'da', 'daa', 'dac' ]);
    d.deleteItem();
    d = new ItemProxy("Test", {
      id : "d",
      name : "D",
      parentId : "",
      itemIds : [ 'dab', 'de', 'dd', 'db', 'da' ]
    });
    dump("Added d");
    expect(getChildIds(d)).toBe(expectArray);
    
    expectArray = JSON.stringify([ 'dab', 'de', 'dd', 'db', 'da', 'da1', 'daa', 'dac', 'dz1', 'dz2', 'dz3' ]);
    var da1 = new ItemProxy("Test", {
      id : "da1",
      name : "DA1",
      parentId : "d"
    });
    var dz1 = new ItemProxy("Test", {
      id : "dz1",
      name : "DZ1",
      parentId : "d"
    });
    var dz2 = new ItemProxy("Test", {
      id : "dz2",
      name : "DZ2",
      parentId : "d"
    });
    var dz3 = new ItemProxy("Test", {
      id : "dz3",
      name : "DZ3",
      parentId : "d"
    });
    dump("Added da1, dz1-dz2");
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify([ 'de', 'da', 'da1', 'daa', 'dab', 'dac', 'dd', 'dz1', 'dz2', 'dz3', 'db' ]);
    newDItem = JSON.parse(JSON.stringify(d.item));
    newDItem.itemIds = [];
    d.updateItem("Test", newDItem);
    dump("Removed itemIds");
    expect(getChildIds(d)).toBe(expectArray);
    
    expectArray = JSON.stringify([ 'dac', 'da', 'daa', 'dab', 'de', 'dd', 'dz1', 'dz2', 'db', 'da1', 'dz3' ]);
    newDItem = JSON.parse(JSON.stringify(d.item));
    newDItem.itemIds = [ 'dac', 'da', 'daa', 'dab', 'de', 'dd', 'dz1', 'dz2', 'db' ];
    d.updateItem("Test", newDItem);
    dump("Added itemIds");
    expect(getChildIds(d)).toBe(expectArray);

    expectArray = JSON.stringify(['de', 'da', 'da1', 'daa', 'dab', 'dac', 'dd', 'dz1', 'dz2', 'dz3', 'db']);
    d.makeChildrenAutoOrdered();
    dump("Auto Ordered");
    expect(getChildIds(d)).toBe(expectArray);
    expect(d.item.itemIds.length).toBe(0);


    expectArray = JSON.stringify(['de', 'da', 'da1', 'daa', 'dab', 'dac', 'dd', 'dn', 'dz1', 'dz2', 'dz3', 'db']);
    var dn = new ItemProxy("Test", {
      id : "dn",
      name : "DN",
      parentId : "d"
    });
    dump("Added DN to Auto List");
    expect(getChildIds(d)).toBe(expectArray);



    d.makeChildrenManualOrdered();
    dump("Manual Ordered");
    expect(getChildIds(d)).toBe(expectArray);
    expect(d.item.itemIds.length).toBe(12);


  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Get Ancestors", function() {
    // console.log("::: Getting AB ancestors");
    var ab = ItemProxy.getProxyFor('ab');
    var abAncestors = ab.getAncestorProxies();
    var expected = [ 'b', 'ROOT' ];
    for ( var ancestorIdx in abAncestors) {
      var ancestor = abAncestors[ancestorIdx]
      // console.log(ancestor.item.id + " - " + ancestor.item.name);

      expect(ancestor.item.id).toBe(expected[ancestorIdx]);
    }    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  xit("Should Remove All Items From Repository", ()=> {
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  xit("Displays Tree Hash Map", ()=> {
    var treeHashMap = ItemProxy.getAllTreeHashes();
    console.log(treeHashMap);  
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Hash Before Item Loaded Creates Tree Hash On Internal Node", ()=> {

    var item = {
      id:"test-item-id",
      name: "TestItem ",
      parentId: "Not_A_Valid_Parent_Id"
    };
    var proxy = new ItemProxy("Test", item);

    dumpHashFor(proxy.parentProxy);
    dumpHashFor(proxy);
    ItemProxy.loadingComplete();

    expect(proxy.parentProxy.treeHashEntry.treeHash).toEqual("61a57146a9fa2422b0940680c7449a42db3b71ab");
    expect(proxy.parentProxy.treeHashEntry.childTreeHashes["test-item-id"]).toEqual("53688a4a9207203c25da692d634bd58305ae1313");
    expect(proxy.treeHashEntry.treeHash).toEqual("53688a4a9207203c25da692d634bd58305ae1313");
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Calculates OID and TreeHash For a Leaf Node", ()=> {
    
    var thProxy = new ItemProxy("Test", {
      id : "TH-Node-A",
      name : "Node A",
      parentId : ""
    });
    console.log("::: Node A");
    console.log(thProxy.treeHashEntry);
    expect(thProxy.treeHashEntry.treeHash).toBe("c821eb4089f0a835ab941c9b0db64f2ad32b44c7");
    
    console.log("::: Update Node");
    var copyOfItem = getCopyOfItem(thProxy);
    var itemToModify = getCopyOfItem(thProxy);
    
    itemToModify.name = "Node A Updated";
    thProxy.updateItem("Test", itemToModify);
    console.log(thProxy.treeHashEntry);
    expect(thProxy.treeHashEntry.treeHash).toBe("2719d45fee33b0f3dbd72135fb57283b87bb321b");

    
    console.log("::: Putting back to same item");
    thProxy.updateItem("Test", copyOfItem);
    console.log(thProxy.treeHashEntry);
    expect(thProxy.treeHashEntry.treeHash).toBe("c821eb4089f0a835ab941c9b0db64f2ad32b44c7");
    
    console.log("===");
    console.log(thProxy.document());
    console.log("===");
    
    expect(thProxy.treeHashEntry.oid).toBe("96f356b031940440afda4aab888a66753a3dcf47");
    expect(thProxy.treeHashEntry.treeHash).toBe("c821eb4089f0a835ab941c9b0db64f2ad32b44c7");

  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Isolates Repositories in Tree Hash", ()=> {
    var repoA = new ItemProxy("Repository", {
      name: "Repository A",
      id: "AAAA-AAAA"
    });
    
    var a1 = new ItemProxy("Test", {
      name: "Item A1",
      id: "AAAA-1111",
      parentId: "AAAA-AAAA"      
    });
    
    var repoB = new ItemProxy("Repository", {
      name: "Repository B",
      id: "BBBB-BBBB",
      parentId: "AAAA-AAAA"
    });
    
    const expectedRepoAChildHashes = {
        'AAAA-1111': '32e9a0cf54ff2a87304865fe3b99723dac910278',
        'BBBB-BBBB': 'Repository-Mount'
    };

    const expectedInitialRepoBChildHashes = {};

    const expectedFinalRepoBChildHashes = {
        'BBBB-1111' : '7b1715172e8c5491ef5265adf78695d7ef9cb9ad'
    };
    
    dumpHashFor(repoA, "Isolated Nested Repositories");
    dumpHashFor(a1);
    dumpHashFor(repoB);
    expect(repoA.treeHashEntry.childTreeHashes).toEqual(expectedRepoAChildHashes);
    expect(repoA.treeHashEntry.treeHash).toEqual("f8730b5510c1d47c3082836728336cd4a68f34d5");
    expect(repoB.treeHashEntry.childTreeHashes).toEqual(expectedInitialRepoBChildHashes);
    
    var b1 = new ItemProxy("Test", {
      name: "Item B1",
      id: "BBBB-1111",
      parentId: "BBBB-BBBB"      
    });

    dumpHashFor(repoA, "Added Item in Repo B, should not affect Repo A");
    dumpHashFor(a1);
    dumpHashFor(repoB);
    // Only Repo B should have been affected
    expect(repoA.treeHashEntry.childTreeHashes).toEqual(expectedRepoAChildHashes);
    expect(repoA.treeHashEntry.treeHash).toEqual("f8730b5510c1d47c3082836728336cd4a68f34d5");
    expect(repoB.treeHashEntry.childTreeHashes).toEqual(expectedFinalRepoBChildHashes);
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  xit("Writes a File", ()=>{
    var jsonObject = {
      name: "Some Content",
      id: "Some File"
    }
    var fs = require('fs');
    
    console.log("::: Writing the file")
    fs.writeFileSync("w.out", JSON.stringify(jsonObject, null, '  '), {encoding: 'utf8', flag: 'w'});      
  });

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Should Ensure Fields Are In Consistent Order", ()=>{

    var modelDefMap = {
        Test: {
          "name": "Test",
          "base": "PersistedModel",
          "strict": "validate",
          "idInjection": true,
          "trackChanges": false,
          "properties": {
            "id": {
              "type": "string",
              "id": true,
              "defaultFn": "guid"
            },
            "name": {
              "type": "string",
              "required": true
            },
            "parentId": {
              "type": "string",
              "default": ""
            }
          },
          "validations": [],
          "relations": {},
          "acls": [],
          "methods": []
      }        
    }
    
    ItemProxy.loadModelDefinitions(modelDefMap);

    var object1a = {
        name: "Some Content",
        id: "id-1a1a1a"        
    };
    
    var object1b = {
        id: "id_1a1a1a",
        name: "Some Content"
    };
    
    var obj1a = new ItemProxy("Test", object1a);

    expect(Object.keys(obj1a.item)).toEqual([ 'id', 'name' ]);
    
  });
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Should Load Class Model Definitions", ()=>{
    var fs = require('fs');
    var modelDefData = fs.readFileSync("./kdb/modelDef.json", {encoding: 'utf8', flag: 'r'});
    var modelDefMap = JSON.parse(modelDefData);
   
    ItemProxy.loadModelDefinitions(modelDefMap);
    ItemProxy.loadingComplete();
    
    var modelDefProxy = ItemProxy.getProxyFor("Model-Definitions");

    dumpEnabled = true;
    dumpHashFor(modelDefProxy, "First Load");
    
    var modelDef = ItemProxy.getModelDefinitions();

    ItemProxy.loadModelDefinitions(modelDef);
    ItemProxy.loadingComplete();
    dumpHashFor(modelDefProxy, "Second Load");

    
  });

});
