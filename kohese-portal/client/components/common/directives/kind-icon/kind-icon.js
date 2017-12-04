function KindIconDirective () {
  return {
    restrict: 'E',
    scope: {
      kind : '='
    },
    templateUrl: 'components/common/directives/kind-icon/kind-icon.html'
  }
}

export const KindIconModule = {
  init: function () {
    angular.module('app.directives.kindicon', [])
      .directive('kindIcon', KindIconDirective);
  }
}
