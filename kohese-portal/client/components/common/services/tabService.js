/**
 * Created by josh on 8/14/15.
 */

angular.module('app.services.tabservice', [])
    .service('tabService', function tabService(){
        var tService = this;

        tService.currentTab = {};

        tService.setCurrentTab = function(tab) {
            console.log("Tab set");
            tService.currentTab = tab;
        };

        tService.getCurrentTab = function() {
            return tService.currentTab;
        }


    });