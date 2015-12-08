/**
 * Created by josh on 8/14/15.
 */

function TabService($state, $rootScope) {
    var tService = this;
    var _ = require('underscore');

    tService.tabCount = 0;
    tService.currentTab = {};

    //
    // Tab Book-keeping
    //

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
    };

    //
    // Bundler Service
    //

    tService.bundler = [];

    tService.bundleController = function (controller, type, tabId) {
        var bundle = tService.bundler[tabId];
        bundle.controllers[type] = controller;
    };

    tService.restoreControllerData = function (tabId, type, toController) {
        var bundlerPosition = tService.bundler[tabId];
        if (bundlerPosition) {
            var fromController = bundlerPosition.controllers[type];
            if (fromController) {
                for (var key in fromController) {
                    if (fromController.hasOwnProperty(key) && (key.charAt(0) !== '$')
                        && !_.isEqual(fromController[key], toController[key])) {
                        toController[key] = fromController[key];
                    }
                }
                return true;
            }
        }
        return false;
    };

    tService.updateState = function (newState, tabId) {
        var bundle = tService.bundler[tabId];
        bundle.lastState = bundle.currentState;
        bundle.currentState = newState;
    };

    tService.getLastState = function (tabId) {
        return tService.bundler[tabId].lastState;
    };

    tService.getCurrentState = function (tabId) {
        return tService.bundler[tabId].lastState;

    };

    $rootScope.$on('$stateChangeSuccess', function () {
        var currentBundle = tService.bundler[tService.getCurrentTab().id];
        if (currentBundle) {
            currentBundle.lastState = currentBundle.currentState;
        } else {
            currentBundle = new Bundle();
        }
        currentBundle.currentState = $state.current.name;
        tService.bundler[tService.getCurrentTab().id] = currentBundle;
        console.log(tService.bundler);
    });

    function Bundle() {
        var bundle = this;
        bundle.controllers = {};
    }

}

export default () => {
    angular.module('app.services.tabservice', [])
        .service('tabService', TabService);
}