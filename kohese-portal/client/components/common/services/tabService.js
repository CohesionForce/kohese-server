/**
 * Created by josh on 8/14/15.
 */

export default () => {
    angular.module('app.services.tabservice', [])
        .service('tabService', function tabService() {
            var tService = this;

            tService.tabCount = 0;
            tService.currentTab = {};

            tService.incrementTabs = function () {
                tService.tabCount++
            };

            tService.getTabId = function () {
                return tService.tabCount;
            };

            tService.setCurrentTab = function (tab) {
                //console.log("Tab set");
                tService.currentTab = tab;
            };

            tService.getCurrentTab = function () {
                return tService.currentTab;
            }


        });
}