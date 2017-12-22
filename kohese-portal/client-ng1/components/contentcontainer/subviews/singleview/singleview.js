/**
 * Created by josh on 7/28/15.
 *
 * Component specific directive
 */

function SingleViewController($scope, tabService) {
  var ctrl = this;
  var tab = tabService.getCurrentTab();
  tab.setScope($scope);
}

function SingleViewDirective() {
  return {
    restrict: 'A',
    controller: 'SingleViewController as ctrl',
    templateUrl: 'components/contentcontainer/subviews/singleview/singleview.html',
    replace: true,
    link: function (scope, element, attribute) {
      //console.log("Single View is linked")
    }
  };
}


export default containerModule => {
  containerModule
    .directive('singleView', SingleViewDirective)
    .controller('SingleViewController', SingleViewController)
};


