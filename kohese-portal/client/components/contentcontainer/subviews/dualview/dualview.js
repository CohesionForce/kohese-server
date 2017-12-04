/**
 * Created by josh on 7/28/15.
 *
 * Component specific directive
 */


var DualViewController = function ($scope, tabService) {
  var dvCtrl = this;
  var tab = tabService.getCurrentTab();
  tab.setScope($scope);

  $scope.$on('newItemSelected', function onNewItemSelected (event, data) {
    $scope.$broadcast('syncItemLocation', data)
  })
};


export const DualViewModule = {
  init : function (container) {
    container
      .controller('DualViewController', DualViewController)
      .directive('dualView', function () {
        return {
          restrict: 'A',
          templateUrl: 'components/contentcontainer/subviews/dualview/dualview.html',
          replace: true,
          link: function (scope, element, attribute) {
          //console.log("Dual View is linked")
          }
        };
      })
  }
}
