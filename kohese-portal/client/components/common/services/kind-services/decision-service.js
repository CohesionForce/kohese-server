/**
 * Created by josh on 10/7/15.
 */

function DecisionService(ItemRepository, $rootScope){

    var service = this;
    var states = [];

    service.getDecisionStates = getDecisionStates;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getTreeRoot();
        var stateProxy = ItemRepository.getChildByNameFrom(root, 'State');
        var decisionProxy = ItemRepository.getChildByNameFrom(stateProxy,'Decision State');
        states = ItemRepository.getDecendentsOf(decisionProxy);
    });

    function getDecisionStates(){
        return states;
    }



}

export default () => {

    angular.module('app.services.decisionservice', ['app.services.itemservice'])
        .service('DecisionService', DecisionService);
}