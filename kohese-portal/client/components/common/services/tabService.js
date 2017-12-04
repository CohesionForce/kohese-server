/**
 * Created by josh on 8/14/15.
 */

import Tab from './tab-service/tab.js';
import { stateDefinitions } from './tab-service/tab-state-info.json';

function TabService ($state, $rootScope) {
  var tService = this;
  var _ = require('underscore');

  tService.tabCount = 0;
  tService.currentTab = {};

  tService.stateDefinitions = stateDefinitions;

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
    tService.currentTab = tab;
  };

  tService.getCurrentTab = function () {
    return tService.currentTab;
  };

  tService.createTab = function (state, params) {
    var state = tService.stateDefinitions[state];
    var id = tService.tabCount;
    tService.tabCount++;

    var tab = Tab(state,params, id);
    return tab;
  }


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
          if (fromController.hasOwnProperty(key) && key.charAt(0) !== '$'
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
  });

  function Bundle () {
    var bundle = this;
    bundle.controllers = {};
  }
}

export const TabServiceModule = {
  init: function () {
    angular.module('app.services.tabservice', [])
      .service('tabService', TabService);
  }
}
