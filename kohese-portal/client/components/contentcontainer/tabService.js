/**
 * Created by josh on 8/14/15.
 */

angular.module('app.tabservice', [])
    .service('tabService', function tabService(){
        var tService = this;

        tService.currentTab = {title:"Test tab"};

        tService.setCurrentTab = function(tab) {
            tService.currentTab = tab;
        };

        tService.getCurrentTab = function() {
            return tService.currentTab;
        }


    });