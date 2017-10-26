/**
 * Created by josh on 7/1/15.
 */

describe("ItemRepository", function () {
    var service;
    var testItem = {
        title: "Test title",
        description: "This is a test",
        id: "Test+ID",
        parentId: "null"
    };

    beforeEach(function () {
        angular.mock.module('app.services.itemservice');

        inject(function ($injector) {
            service = $injector.get('ItemRepository');
        });

    });

    describe("Lost and Found", function () {
        it("Should attach the item to the lost and found node", function () {
            service.attachToLostAndFound(testItem);
            expect(service.tree.proxyMap["LOST+FOUND"].children["Test+ID"].title).toBe("Test title");
        });
    })

});
