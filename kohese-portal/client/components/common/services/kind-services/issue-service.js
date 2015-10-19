/**
 * Created by josh on 10/16/15.
 */
function IssueService(ItemRepository, $rootScope){

    var service = this;
    var states = [];

    service.getIssueStates = getIssueStates;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getTreeRoot();
        var stateProxy = ItemRepository.getChildByNameFrom(root, 'State');
        var issueProxy = ItemRepository.getChildByNameFrom(stateProxy,'Issue State');
        states = ItemRepository.getDecendentsOf(issueProxy);
    });

    function getIssueStates(){
        return states;
    }



}

export default () => {

    angular.module('app.services.issueservice', ['app.services.itemservice'])
        .service('IssueService', IssueService);
}