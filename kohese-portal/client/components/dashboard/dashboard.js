/**
 * Created by josh on 10/27/15.
 */

function DashboardController(UserService, $scope, $rootScope, tabService, ItemRepository) {
    const ctrl = this;
    var currentTab = tabService.getCurrentTab();

    ctrl.itemList = ItemRepository.getAllItemProxies();
    ctrl.currentUser = UserService.getCurrentUser();
    ctrl.acceptedFilter = {
        item : {
            actionState: 'Accepted',
            assignedTo: ctrl.currentUser
        }
    };
    ctrl.assignedFilter = {
        item : {
            actionState: 'Assigned',
            assignedTo: ctrl.currentUser
        }
    };
    ctrl.inWorkFilter = {
        item : {
            actionState: 'In Work',
            assignedTo: ctrl.currentUser
        }
    };
    ctrl.inVerificationFilter = {
        item : {
            actionState: 'In Verification',
            assignedTo: ctrl.currentUser
        }
    };
    ctrl.requiresActionFilter = {
        item : {
            issueState: 'Requires Action',
        }
    };
    ctrl.observedIssuesFilter = {
        item : {
            issueState: 'Observed'
        }
    };
    ctrl.inAnalysisIssueFilter = {
        item : {
            issueState: 'In Analysis'
        }
    };
    ctrl.assignedTasksFilter = {
        item: {
            taskState: 'Assigned',
            assignedTo: ctrl.currentUser
        }
    };
    ctrl.acceptedTasksFilter = {
        item: {
            taskState: 'Accepted',
            assignedTo: ctrl.currentUser
        }
    };
    ctrl.inWorkTasksFilter = {
        item: {
            taskState: 'In Work',
            assignedTo: ctrl.currentUser
        }
    };


    ctrl.navigate = function (state, params, type) {
        $rootScope.$broadcast('navigationEvent',
            {
                state: state,
                params: params,
                type: type
            });
    };
    $scope.$on('itemRepositoryReady', function () {
        ctrl.itemList = ItemRepository.getAllItemProxies();
    });


}


export default () => {

    angular.module('app.dashboard', [
        'app.services.userservice',
        'app.services.tabservice',
        'app.services.itemservice'])
        .controller('DashboardController', DashboardController);


}
