/**
 * Created by josh on 11/4/15.
 */
function NavigationService($state, tabService, $rootScope){
    var service = this;

    var currentState = [];
    currentState[0] = $state.current.name;
    var lastState = [];

    service.updateState = updateState;
    service.getLastState = getLastState;
    service.getCurrentState = getCurrentState;



    function updateState(newState){
        lastState = currentState;
        currentState[tabService.getCurrentTab().id] = newState;
    }

    function getLastState(tabId){
        return lastState[tabId];
    }

    function getCurrentState(tabId){
        return currentState[tabId];
    }

    $rootScope.$on('$stateChangeSuccess', function(){
        lastState[tabService.getCurrentTab().id] = currentState[tabService.getCurrentTab().id];
        currentState[tabService.getCurrentTab().id] = $state.current.name;
    })
}



export default () => {
    angular.module('app.services.navigationservice', ['app.services.tabservice'])
    .service('NavigationService', NavigationService)
}