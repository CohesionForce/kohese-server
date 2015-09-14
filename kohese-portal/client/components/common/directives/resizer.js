/**
 * Created by josh on 6/18/15.
 *
 * Sibling to the resizeable directive. Creates a bar which can resize elements on a page. Requires resizeable directive
 * when in multi-workspace.
 */


export default () => {
    angular.module('app.directives.resizer', ['app.services.resizerservice'])
        .directive('resizer', function ($document, resizerService) {

            return function ($scope, $element, $attrs) {
                var y;

                $scope.$on('$stateChangeStart', function(){
                    resizerService.setY($attrs.resizerKey, y);
                });

                $scope.$on('$viewContentLoaded',
                    function (event) {
                        y = resizerService.getY($attrs.resizerKey);
                        $element.css({
                            bottom: y + 'px'
                        });

                        $($attrs.resizerTop).css({
                            bottom: (y + parseInt($attrs.resizerHeight)) + 'px'
                        });
                        $($attrs.resizerBottom).css({
                            height: y + 'px'
                        });
                    });

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

                        $element.css({
                            bottom: y + 'px'
                        });

                        $($attrs.resizerTop).css({
                            bottom: (y + parseInt($attrs.resizerHeight)) + 'px'
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
        });
}
