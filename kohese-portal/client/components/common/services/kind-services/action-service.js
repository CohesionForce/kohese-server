/**
 * Created by josh on 10/7/15.
 */
function ActionService(ItemRepository, $rootScope){

    var service = this;
    var states = [];

    service.getActionStates = getActionStates;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getRootProxy();
        var stateProxy = root.getChildByName('State');
        var actionProxy = stateProxy.getChildByName('Action State');
        states = actionProxy.getDecendents();
    });

    var root = ItemRepository.getRootProxy();
    var stateProxy = root.getChildByName('State');
    var actionProxy = stateProxy.getChildByName('Action State');
    states = actionProxy.getDecendents();

    function getActionStates(){
        return states;
    }



}

export default () => {

    angular.module('app.services.actionservice', ['app.services.itemservice'])
        .service('ActionService', ActionService);
}