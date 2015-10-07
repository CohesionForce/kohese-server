/**
 * Created by josh on 10/7/15.
 */
function ActionService(ItemRepository, $rootScope){

    var service = this;
    var states = [];

    service.getActionStates = getActionStates;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getTreeRoot();
        var stateProxy = ItemRepository.getChildByNameFrom(root, 'State');
        var actionProxy = ItemRepository.getChildByNameFrom(stateProxy,'Action State');
        states = ItemRepository.getDecendentsOf(actionProxy);
    });

    function getActionStates(){
        return states;
    }



}

export default () => {

    angular.module('app.services.actionservice', ['app.services.itemservice'])
        .service('ActionService', ActionService);
}