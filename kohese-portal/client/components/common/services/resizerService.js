/**
 * Created by josh on 9/14/15.
 */
export default () => {
    angular.module('app.services.resizerservice', [])
        .service('resizerService', function resizerService() {
            let rService = this;

            let yStore = {};

            rService.getY = function(resizerId){
                return yStore[resizerId];
            };

            rService.setY = function(resizerId, yValue){
                yStore[resizerId] = yValue;
            }


        });
}