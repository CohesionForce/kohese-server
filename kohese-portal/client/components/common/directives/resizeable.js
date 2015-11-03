/**
 * Created by josh on 8/18/15.
 *
 * Sibling to the resizer directive, allows for resizeable views on multiple workspaces. Currently only works for
 * height resizing.
 *
 * The directives pulls in the expected id of the content area from a serviceand verifies it against the id passed in.
 * Once verified it adds an inline style to the element that can then be dynamically modified by the resizer directive.
 */

function Resizeable(tabService) {
    return function ($scope, $element, $attrs) {

        var topID = "top-content" + tabService.getTabId();
        var bottomID = "bottom-content" + tabService.getTabId();

        if ($attrs.id === topID) {
            //console.log("Top content connected");

            // TBD:  Need to find a better way to get the top to fill
            //       the available space
            var pwHeight = $("#page-wrapper").height();
            $element.css({
                height: (pwHeight - 461 - 6) + 'px'
            });

        }
        if ($attrs.id === bottomID) {
            //console.log("Bottom Content Connected");
            $element.css({
                height: 461 + 'px'
            });
        }
    }
}


export default () => {

    angular.module('app.directives.resizeable', ['app.services.tabservice'])
        .directive('resizeable', Resizeable);
}
