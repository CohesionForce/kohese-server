export default () => {
  angular.module('app.filters.htmlfilters', [])
    .filter('trustAsHTML', ['$sce', function ($sce) {
      return function (text) {
        console.log(text);
        return $sce.trustAsHtml(text);
      };
    }]);
}