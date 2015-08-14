/**
 * Created by josh on 8/14/15.
 */

angular.module('app.tabservice', [])
    .service('tabService', function tabService(){
        var tService = this;

        tService.currentTab = {};

        tService.setCurrentTab = function(tab) {
            console.log("Tab set");
            tService.currentTab = tab;
        };

        tService.getCurrentTab = function() {
            console.log(tService.currentTab);
            return tService.currentTab;
        }


    });