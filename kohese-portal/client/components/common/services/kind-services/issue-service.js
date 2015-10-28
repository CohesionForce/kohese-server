/**
 * Created by josh on 10/16/15.
 */
function IssueService(ItemRepository, $rootScope){

    var service = this;
    var states = [];

    service.getIssueStates = getIssueStates;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getRootProxy();
        var stateProxy = root.getChildByName('State');
        var issueProxy = stateProxy.getChildByName('Issue State');
        states = issueProxy.getDecendents();
    });

    var root = ItemRepository.getRootProxy();
    var stateProxy = root.getChildByName('State');
    var issueProxy = stateProxy.getChildByName('Issue State');
    states = issueProxy.getDecendents();

    function getIssueStates(){
        return states;
    }



}

export default () => {

    angular.module('app.services.issueservice', ['app.services.itemservice'])
        .service('IssueService', IssueService);
}