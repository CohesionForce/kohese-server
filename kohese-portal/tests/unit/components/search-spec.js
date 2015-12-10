/**
 * New node file
 */

var MockItemRepository = require('../mock/MockItemRepository');
var MockTabService = require('../mock/MockTabService');
var MockUserService = require('../mock/MockUserService');
var MockDecisionService = require('../mock/MockDecisionService');
var MockActionService = require('../mock/MockActionService');
var MockSearchService = require('../mock/MockSearchService');

describe("Search Controller Test", function() {

	var searchController;
    var mockTabService = new MockTabService();
    var mockItemRepository = new MockItemRepository();
    var mockUserService = new MockUserService();
    var mockDecisionService = new MockDecisionService();
    var mockActionService = new MockActionService();
    var mockSearchService = new MockSearchService();
    
	beforeEach(angular.mock.module('app.search'));

	beforeEach(function() {

		state = {
		    callData : undefined,
		    id : undefined,
			go : function(data, object) {
				state.callData = data;
				state.id = object.id;
			}
		};

		stateParams = {
		    id : "stateParams.id"
		};

		scope = {
		    $on : function(name, func) {
		        
		    }
		};
		
		filter = function(name) {
		    return function(something) {
		        
		    };
		};
	});

	beforeEach(inject(function($controller) {
		searchController = $controller('SearchController', {
			ItemRepository : mockItemRepository,
			UserService: mockUserService,
			DecisionService: mockDecisionService,
			ActionService: mockActionService,
			tabService : mockTabService,
			SearchService: mockSearchService,
			$state : state,
			$scope : scope,
			$stateParams : stateParams,
			$filter: filter });
	}));

	it("Check Tree Navigation", function() {
	    searchController.navigateToTree();
	    expect(mockTabService.tab.state).toBe('explore.edit');
	    expect(state.callData).toBe('kohese.explore.edit');
	    expect(state.id).toBe(stateParams.id);
	}),
	
	it("Check Tree Navigate", function() {
	    console.log('Create Test for tree navigate');
	    expect(true).toBe(true);
	}),
	
	it("Check Tree Assigned to Filter", function() {
        console.log('Create Test for tree navigate');
        expect(true).toBe(true);
	}),
	
	it("Check Tree Search String Filter", function() {
        console.log('Create Test Search String Filter');
        expect(true).toBe(true);
	});

});

describe("suite name", function() {
});