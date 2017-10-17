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
            id : 'Tab[0]'
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
        expect(tab.params.id).toBe('Tab[0]')
        expect(tab.state).toBe('kohese.explore.edit');
    })

    // Test Container Constructor
    it("starts with the desired tabs", function()
    {
        tab = mockTabService.getCurrentTab();
        expect(tab).not.toBeUndefined();
        expect(tab).not.toBeNull();
        expect(tab.title).toBe('Explore');
        expect(tab.state).toBe('kohese.explore.edit');
        expect(tab.params).not.toBeUndefined();
        expect(tab.params).not.toBeNull();
        expect(tab.params.id).toBe('Tab[0]');
        expect(tab.type).toBe('dualview');
    });

    // Test set tabs method
    it("creates a tab", function()
    {
        tab = mockTabService.getCurrentTab();
        controller.addTab(mockState,mockStateParams);
        newtab = mockTabService.getCurrentTab();
        expect(newtab).not.toBeUndefined();
        expect(newtab).not.toBeNull();
        expect(tab).not.toBe(newtab);
    });

    it("creates a new dashboard when the only tab is deleted", ()=>{
        controller.deleteTab(controller.tabs[0]);
        tab = mockTabService.getCurrentTab();
        expect(tab).not.toBeUndefined();
        expect(tab).not.toBeNull();
        expect(tab.title).toBe('Dashboard')
        expect(tab.state).toBe('kohese.dashboard');
    })

    describe('Delete Tab Functionality', ()=>{

        beforeEach(() => {
            controller.createTab('kohese.explore.edit', {id:"Tab[1]"});
        })

        it("selects the tab to the right when the first tab is deleted", () => {
            controller.deleteTab(controller.tabs[0]);
            tab = mockTabService.getCurrentTab();
            expect(tab).not.toBeUndefined();
            expect(tab.state).toBe('kohese.explore.edit');
            expect(tab.params.id).toBe('Tab[1]');
        });

        it("selects the tab to the left when final tab is deleted", ()=>{
            controller.setTab(controller.tabs[1]);
            controller.deleteTab(controller.tabs[1]);
            tab = mockTabService.getCurrentTab();
            expect(tab).not.toBeUndefined();
            expect(tab.params.id).toBe('Tab[0]');
        })

    });
})