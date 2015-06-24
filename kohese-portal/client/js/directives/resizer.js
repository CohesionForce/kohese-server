/**
 * Created by josh on 6/18/15.
 */
angular.module('mc.resizer', [])
  .directive('resizer', function ($document) {

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

      //$scope.$on('enterItem', function (event) {
      //  $($attrs.resizerBottom).css({
      //    height: y + 'px'
      //  });
      //  console.log($($attrs.resizerBottom).css.height + ":" + y);
      //})

    }
  });
