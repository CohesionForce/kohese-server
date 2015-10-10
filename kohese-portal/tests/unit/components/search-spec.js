/**
 * New node file
 */
describe("Search Controller Test", function() {

	var searchController;
    var mockTabService; 
    var mockItemRepository;

	beforeEach(module('app.search'));

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
		
		mockItemRepository = {
		    getAllItemProxies : function() {
		        return []
		    }    
		}
		
        // Set up the Mock Login Service
        mockTabService = {

            tab : {
                title : undefined,
                type : undefined,
                state : undefined,
                setTitle : function(newTitle) {
                    mockTabService.tab.title = newTitle;
                },
                params : {
                    filter : "This is a filter",
                    id : "mockTabService.tab.params.id"
                },
                setState : function(str) {
                    mockTabService.tab.state = str;
                }
            },

            getCurrentTab : function() {
                return mockTabService.tab;
            }
        };

	});

	beforeEach(inject(function($controller) {
		searchController = $controller('SearchController', {
			ItemRepository : mockItemRepository,
			tabService : mockTabService,
			$state : state,
			$stateParams : stateParams });
	}));

	it("Check Tree Navigation", function() {
	    searchController.navigateToTree();
	    expect(mockTabService.tab.state).toBe('explore.edit');
	    expect(state.callData).toBe('kohese.explore.edit');
	    expect(state.id).toBe(stateParams.id);
	}),
	
	it("Check Tab Update", function() {
	    searchController.updateTab('item123');
	    expect(mockTabService.tab.params.id).toBe('item123');
	    expect(searchController.currentItem).toBe('item123');
	})
	
});

describe("suite name", function() {
});