/**
 * Created by josh on 10/7/15.
 */

function DecisionService(ItemRepository, $rootScope) {

    var service = this;
    var states = [];

    service.getDecisionStates = getDecisionStates;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getRootProxy();
        var stateProxy = root.getChildByName('State');
        var decisionProxy = stateProxy.getChildByName('Decision State');
        states = decisionProxy.getDescendants();
    });

    var root = ItemRepository.getRootProxy();
    var stateProxy = root.getChildByName('State');
    if (stateProxy){
        var decisionProxy = stateProxy.getChildByName('Decision State');
        states = decisionProxy.getDescendants();
    }

    function getDecisionStates() {
        return states;
    }


}

export default () => {

    angular.module('app.services.decisionservice', ['app.services.itemservice'])
        .service('DecisionService', DecisionService);
}