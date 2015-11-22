/**
 * New node file
 */

var MockTabService = require('../mock/MockTabService');
var MockUserService = require('../mock/MockUserService');
var MockItemRepository = require('../mock/MockItemRepository');

describe("DashboardController Test", function()
{
    var controller;
    var mockScope;
    var mockRootScope;
    var broadcast;
    var callData;
    var mockTabService = new MockTabService();
    var mockUserService = new MockUserService();
    var mockItemRepository = new MockItemRepository();
    
    beforeEach(angular.mock.module('app.dashboard'));

    beforeEach(inject(function($q)
    {

        mockUserList = [ 'user1', 'user2', 'user3' ];

        mockScope = {
            $on : function(name, func)
            {
            },
            
            $broadcast : function(data)
            {
                broadcast = data;
            }
        
        };

    }));

    beforeEach(inject(function($controller)
    {
        controller = $controller('DashboardController', {
            UserService : mockUserService,
            $scope : mockScope,
            $rootScope : mockRootScope,
            tabService : mockTabService,
            ItemRepository : mockItemRepository
        });
    }));

    // Test Container Constructor
    it("Test Construction", function()
    {
        expect(controller).toBeDefined();
        expect(controller).not.toBeNull();
        tab = mockTabService.getCurrentTab();
    });

    // Test filters
    it("Test Filter User", function()
    {
        user = mockUserService.getCurrentUser();
        expect(controller.acceptedFilter.item.assignedTo).toBe(user);
        expect(controller.assignedFilter.item.assignedTo).toBe(user);
        expect(controller.inWorkFilter.item.assignedTo).toBe(user);
        expect(controller.inVerificationFilter.item.assignedTo).toBe(user);
        expect(controller.assignedTasksFilter.item.assignedTo).toBe(user);
        expect(controller.acceptedTasksFilter.item.assignedTo).toBe(user);
        expect(controller.inWorkTasksFilter.item.assignedTo).toBe(user);
    });
});

describe("suite name", function()
{
});