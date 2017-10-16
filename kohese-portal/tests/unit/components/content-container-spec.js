/**
 * New node file
 */

var MockTabService = require('../mock/MockTabService');

describe("ContentContainerController Test", function()
{

    var controller;
    var mockScope;
    var callData;
    var broadcast;
    var on = {};
    
    var mockState = {
        current : {
            name : 'kohese.explore.edit'
        },
    
        go : function(data) {
            callData = data;
        }

    }
    var mockStateParams = {
            id : 'testID'
    };

    var mockTabService = new MockTabService();

    beforeEach(angular.mock.module('app.contentcontainer'));

    beforeEach(inject(function($q)
    {

        mockUserList = [ 'user1', 'user2', 'user3' ];

        mockScope = {
            $on : function(name, func)
            {
                on.name = name;
                on.func = func;
            },
            
            $broadcast : function(data)
            {
                broadcast = data;
            }
        
        };

    }));

    beforeEach(inject(function($controller)
    {
        controller = $controller('ContainerController', {
            tabService : mockTabService,
            $scope : mockScope,
            $state : mockState,
            $stateParams : mockStateParams
        });
    }));

    it("Creates a base tab with starting params", ()=> {
        controller.tabs.pop()
        controller.createBaseTab()
        var tab = controller.tabs[0];
        expect(tab.params.id).toBe('testID')
        expect(tab.state).toBe('kohese.explore.edit');
    })

    // Test Container Constructor
    it("Test Construction", function()
    {
        tab = mockTabService.getCurrentTab();
        expect(tab).not.toBeUndefined();
        expect(tab).not.toBeNull();
        expect(tab.title).toBe('Explore');
        expect(tab.state).toBe('kohese.explore.edit');
        expect(tab.params).not.toBeUndefined();
        expect(tab.params).not.toBeNull();
        expect(tab.params.id).toBe('testID');
        expect(tab.type).toBe('dualview');
    });

    // Test set tabs method
    it("Test Create Tab", function()
    {
        tab = mockTabService.getCurrentTab();
        controller.addTab(mockState,mockStateParams);
        newtab = mockTabService.getCurrentTab();
        expect(newtab).not.toBeUndefined();
        expect(newtab).not.toBeNull();
        expect(tab).not.toBe(newtab);
    });
});

describe("suite name", function()
{
});