/**
 * Created by josh on 6/18/15.
 *
 * Sibling to the resizeable directive. Creates a bar which can resize elements on a page. Requires resizeable directive
 * when in multi-workspace.
 */


function Resizer($document) {

    return function ($scope, $element, $attrs) {
        var y;

        $element.on('mousedown', function (event) {
            event.preventDefault();

            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });

        function mousemove(event) {

            if ($attrs.resizer == 'vertical') {
                // Handle vertical resizer
                var x = event.pageX;

                if ($attrs.resizerMax && x > $attrs.resizerMax) {
                    x = parseInt($attrs.resizerMax);
                }

                $element.css({
                    left: x + 'px'
                });

                $($attrs.resizerLeft).css({
                    width: x + 'px'
                });
                $($attrs.resizerRight).css({
                    left: (x + parseInt($attrs.resizerWidth)) + 'px'
                });

            } else {
                // Handle horizontal resizer
                y = window.innerHeight - event.pageY;

                $($attrs.resizerTop).css({
                    height: (window.innerHeight - y - 90) + 'px'
                });

                $($attrs.resizerBottom).css({
                    height: y + 'px'
                });
            }

        }

        function mouseup() {
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);
        }


    }
}

export default () => {
    angular.module('app.directives.resizer', [])
        .directive('resizer', Resizer);
}
