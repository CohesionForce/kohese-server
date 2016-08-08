describe("ItemProxy Test", function()
{

    var ItemProxy = require('../../../common/models/item-proxy.js');
    var root = ItemProxy.getRootProxy();
    var lostAndFound = ItemProxy.getProxyFor("LOST+FOUND");
    var a, aa, newAAItem, bb, b, ab;
    console.log(__dirname);
    console.log("::: Starting Item Proxy Test");

    dump = function(message)
    {
        if (message) {
            console.log(">>> " + message);
        }

        ItemProxy.dumpAllProxies();
        console.log("");
        root.dumpProxy();
        console.log("Root Descendants: " + root.descendantCount);
        console.log("");
        lostAndFound.dumpProxy();
        console.log("-----------------------------------------");
    }

    it("Add Node Without Parent", function()
    {
        dump('--- Beginning state');
        expect(root).toBeDefined();
        console.log("::: Adding node without parent");
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

    it("Add Parent", function()
    {
        console.log("::: Adding parent");
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

    it("Add Bs", function()
    {
        console.log("::: Adding b, bbb");
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

    it("Adding bb", function()
    {
        console.log("::: Adding bb");
        bb = new ItemProxy("Test", {
            id : "bb",
            name : "BB",
            parentId : "b"
        });
        dump("Added bb");
        
        expect(b.children[0].item.id).toBe('bb');
        expect(b.item.id).toBe(bb.parentProxy.item.id);
        
    });

    it("Delete a", function()
    {
        console.log("::: Deleting a");
        
        expect(root.children[0].item.id).toBe('a');
        
        a.deleteItem();
        dump("Deleted a");
        
        expect(root.children[0].item.id).toBe('b');
    });

    it("Changing parent of aa", function()
    {
        console.log("::: Changing parent of aa");
        console.log(aa.item);
        newAAItem = JSON.parse(JSON.stringify(aa.item));
        newAAItem.parentId = "b";
        newAAItem.description = "b with changes";
        delete newAAItem.uniq;
        console.log(newAAItem);
        
        var temp = aa.item.id;
        
        aa.updateItem("Test", newAAItem);
        console.log(aa.item);
        dump("Changed aa parent");
        
        expect(aa.item.parentId).toBe('b');
        expect(aa.item.description).toBe('b with changes');
        expect(aa.item.id).toBe(temp);
    });

    it("Deleting description for aa", function()
    {
        console.log("::: Deleting description for aa");
        
        var temp = aa.item.id;
        
        delete newAAItem.description;
        aa.updateItem("Test", newAAItem);
        console.log(aa.item);
        dump("Deleted aa description");
        
        expect(aa.item.description).toBe(undefined);
        expect(aa.item.id).toBe(temp);
    });

    it("Changing parent of bb to ROOT", function()
    {
        console.log("::: Changing parent of bb to ROOT");
        var newBBItem = JSON.parse(JSON.stringify(bb.item));
        newBBItem.parentId = "";
        bb.updateItem("Test", newBBItem);
        dump("Changed bb parent to ROOT");
        
        expect(bb.item.parentId).toBe('');
        expect(bb.parentProxy).toBe(root);
        expect(root.getChildByName('BB')).toBe(bb);
    });

    it("Changing parent of bb to c", function()
    {
        console.log("::: Changing parent of bb to c");
        var newBBItem = JSON.parse(JSON.stringify(bb.item));
        newBBItem.parentId = "c";
        bb.updateItem("Test", newBBItem);
        dump("Changed bb parent to c");
        
        var c = ItemProxy.getProxyFor('c');
        expect(bb.item.parentId).toBe('c');
        expect(bb.parentProxy).toBe(c);
        expect(c.getChildByName('BB')).toBe(bb);
    });

    it("Morph b into a NewTest", function()
    {
        console.log("::: Morph b into a NewTest");
        var newBItem = JSON.parse(JSON.stringify(b.item));
        b.updateItem("NewTest", newBItem);
        dump("Change b to a NewTest kind");
        
        expect(b.kind).toBe('NewTest');
    });

    it("Renaming an item", function()
    {
        console.log("::: Preparing to rename an item");
        ab = new ItemProxy("Test", {
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
        
        var expectArray = JSON.stringify(['aa','ab','ac','ad','ae']);
        function getChildIds(item) {
        	var temp = [];
        	for (var i = 0; i< item.children.length; i++) {
        		temp.push(item.children[i].item.id);
        	}
        	return JSON.stringify(temp);
        };
        
        expect(getChildIds(b)).toBe(expectArray);

        var newAEItem = JSON.parse(JSON.stringify(ae.item));
        newAEItem.name = "A - New Name - AE";
        ae.updateItem("Item", newAEItem);
        dump("AE Name Updated")
        
        expectArray = JSON.stringify(['ae','aa','ab','ac','ad']);
        expect(getChildIds(b)).toBe(expectArray);
        
        var newABItem = JSON.parse(JSON.stringify(ab.item));
        newABItem.name = "New Name - AB";
        ab.updateItem("Item", newABItem);
        dump("AB Name Updated")
        
        expectArray = JSON.stringify(['ae','aa','ac','ad','ab']);
        expect(getChildIds(b)).toBe(expectArray);

        var newAAItem = JSON.parse(JSON.stringify(aa.item));
        newAAItem.name = "B - New Name - AA";
        aa.updateItem("Item", newAAItem);
        dump("AA Name Updated")
        
        expectArray = JSON.stringify(['ae','ac','ad','aa','ab']);
        expect(getChildIds(b)).toBe(expectArray);
    });
    
    it("Get Ancestors",function(){
      console.log("::: Getting AB ancestors");
      var abAncestors = ab.getAncestorProxies();
      var expected = ['b', 'ROOT'];
      for (var ancestorIdx in abAncestors){
        var ancestor = abAncestors[ancestorIdx]
        console.log(ancestor.item.id + " - " + ancestor.item.name);  
        
        expect(ancestor.item.id).toBe(expected[ancestorIdx]);
      }
      
    });
});
