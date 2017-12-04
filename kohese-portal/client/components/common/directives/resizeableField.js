/**
 * Created by josh on 11/17/15.
 */

function ResizeableField () {
  return function ($scope, $element, $attrs) {
    $($element).autoResize();
  };
}

export const ResizeableModule = {
  init: function () {
    angular.module('app.directives.resizeablefield', [])
      .directive('resizeableField', ResizeableField)
  }
}
