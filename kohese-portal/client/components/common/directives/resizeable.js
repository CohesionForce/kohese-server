/**
 * Created by josh on 8/18/15.
 */

var ResizeableController = function(tabService){
    var ctrl = this;

};


angular.module('app.directives.resizeable', ['app.services.tabservice'])
    .controller('ResizeableController', ResizeableController)
    .directive('resizeable', function (tabService) {
        return function ($scope, $element, $attrs) {

            var topID = "top-content" + tabService.getTabId();
            var bottomID = "bottom-content" + tabService.getTabId();

            if ($attrs.id === topID){
                console.log("Top content connected");
            $element.css({
                    bottom: 356 + 'px'
                })
        }
            if ($attrs.id === bottomID) {
                console.log("Bottom Content Connected");
                $element.css({
                    height: 350 + 'px'
                })
            }
        }
});
