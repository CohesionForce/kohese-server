/**
 * Created by josh on 6/17/15.
 */

export default () => {

    var app = angular.module('app.directives.navigation', []);
    var appBarDirective = function () {
        return {
            restrict: 'EA',
            templateUrl: 'components/common/directives/navDirectives/appBar.html'
        }
    };

    app
        .directive('appBar', appBarDirective)



};
