function Tab(state, params, id) {
    var tab = {};
    var bundleListener;
    tab.title = state.title;
    tab.type = state.type;
    tab.params = (state.params) ? params : {};
    tab.state = state.state;
    tab.scope = {};
    tab.content = {};
    tab.id = id;

    var stateDefinitions = require('./tab-state-info.json');
    tab.paramKeys = stateDefinitions[tab.state].params;

    tab.setScope = function (scope) {
        tab.scope = scope;
        bundleListener = tab.scope.$on('tabSelected', function (event, data) {
            if (data === tab.id) {
                console.log('Tab Selected :: Bundle Listener');
                tab.scope.$broadcast('bundleReady');
                bundleListener();
            }
        })
    };

    tab.setState = function (state, params) {
        var stateDefinition = stateDefinitions[state];

        tab.title = stateDefinition.title;
        tab.type = stateDefinition.type;
        tab.params = (stateDefinition.params) ? params : {};
        tab.paramKeys = stateDefinition.params;
        tab.state = state;
    };

    tab.updateFilter = function (string) {
        tab.scope.$broadcast('newFilterString', string);
    };

    tab.toggleBundle = function () {
        bundleListener();
    };

    return tab;
};

export default Tab;