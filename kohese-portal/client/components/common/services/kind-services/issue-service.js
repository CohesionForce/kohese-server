/**
 * Created by josh on 10/16/15.
 */
function IssueService (ItemRepository, $rootScope) {
  var service = this;
  var states = [{item: {name: ''}}];

  service.getIssueStates = getIssueStates;

  $rootScope.$on('itemRepositoryReady', function () {
    var root = ItemRepository.getRootProxy();
    var stateProxy = root.getChildByName('State');
    var issueProxy = stateProxy.getChildByName('Issue State');
    states = [{item: {name: ''}}];
    Array.prototype.push.apply(states, issueProxy.getDescendants());
  });

  var root = ItemRepository.getRootProxy();
  var stateProxy = root.getChildByName('State');
  if (stateProxy) {
    var issueProxy = stateProxy.getChildByName('Issue State');
    Array.prototype.push.apply(states, issueProxy.getDescendants());
  }

  function getIssueStates () {
    return states;
  }
}

export const IssueServiceModule = {
  init: function () {
    angular.module('app.services.issueservice', ['app.services.itemservice'])
      .service('IssueService', IssueService);
  }
}
