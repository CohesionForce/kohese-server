/**
 * Created by josh on 9/1/15.
 */

export default () => {

angular.module('app.services.navigationservice', [])
    .service('navigationService', function navigationService(){

        let navService = this;

        navService.currentFilterString = '';

        navService.setFilterString = function(newString){
            navService.currentFilterString = newString;
        };

        navService.getFilterString = function(){
            return navService.currentFilterString;
        }

    });

}