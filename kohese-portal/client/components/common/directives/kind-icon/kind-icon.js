function KindIconDirective () {
  return {
    restrict: 'E',
    scope: {
      kind : '='
    },
    templateUrl: 'components/common/directives/kind-icon/kind-icon.html'
  }
}

export default () => {
  angular.module('app.directives.kindicon', [])
    .directive('kindIcon', KindIconDirective);
}
