function MockTabService() {
  var service = this;
    
  service.tabCount = 0;
  service.currentTab = {}

  this.getTabId = function() {
    return 'TabID';
  };
    
  this.getCurrentTab = function() {
    return service.currentTab;
  };
    
  this.setCurrentTab = function(tab) {
    service.currentTab = tab;
  };

  this.incrementTabs = function() {
    service.tabCount++
  };
    
  this.restoreControllerData = function(one, two, three) {
    return false;
  };

  this.createTab = function(state, params) {
    var state = service.stateDefinitions[state];
    var id = service.tabCount;
    service.tabCount++;

    var tab = Tab(state,params, id, service.stateDefinitions);
    return tab;
  }

  // Tab imports 

  function Tab(state, params, id, mockStateDefinitions) {
    var tab = {};
    var bundleListener;
    tab.title = state.title;
    tab.type = state.type;
    tab.params = state.params ? params : {};
    tab.state = state.state;
    tab.scope = {};
    tab.content = {};
    tab.id = id;
    
    var stateDefinitions = mockStateDefinitions;
    tab.paramKeys = stateDefinitions[tab.state].params;
    
    tab.setScope = function (scope) {
      tab.scope = scope;
    }
    
    tab.setState = function (state, params) {
      var stateDefinition = stateDefinitions[state];
    
      tab.title = stateDefinition.title;
      tab.type = stateDefinition.type;
      tab.params = stateDefinition.params ? params : {};
      tab.paramKeys = stateDefinition.params;
      tab.state = state;
    };
    
    tab.updateFilter = function (string) {
      return;
    };
    
    tab.toggleBundle = function () {
      return;
    };
    
    return tab;
  }

  service.stateDefinitions = {
    'kohese.dashboard' : {
      'type' : 'singleview',
      'title': 'Dashboard',
      'params': false,
      'state' : 'kohese.dashboard'
    },
    'kohese.explore.edit' : {
      'type' : 'dualview',
      'title': 'Explore',
      'params' : ['id'],
      'state' : 'kohese.explore.edit'
    }
  }
}

module.exports = MockTabService;