export const HTMLFilterModule = {
  init: function () {
    angular.module('app.filters.htmlfilters', [])
      .filter('trustAsHTML', ['$sce', function ($sce) {
        return function (text) {
          return $sce.trustAsHtml(text);
        };
      }]);
  }
}
