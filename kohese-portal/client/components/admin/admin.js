/**
 * Created by josh on 9/22/15.
 */

function AdminController(tabService, $state, $scope, UserService, ItemRepository,
                        SessionService) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(tab.id, 'adminCtrl', this);

    if (!controllerRestored) {
        ctrl.addUserForm = false;
        ctrl.editUserForm = false;
        ctrl.users = [];
        ctrl.sessions = SessionService.sessions;
        ctrl.repositoryList = ItemRepository.getRepositories();
    }

    $scope.$on('$viewContentLoaded', function () {
        tab.setTitle('Admin');
        tab.type = 'singleview';
    });

    /* This handles if the user is coming to the screen for the first time */
    $scope.$on('itemRepositoryReady', function () {
        ctrl.repositoryList = ItemRepository.getRepositories();
        fetchUsers();
    });

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'adminCtrl', tab.id)
    });

    function fetchUsers() {
      ctrl.users = UserService.getAllUsers();
    }

    fetchUsers();


    ctrl.navigate = function (state, type, id) {
        if (state) {
            updateTab(state, type, {id: id});
            $state.go(state, {id: id})
        }
    };

    function updateTab(state, type, params) {
        if (state) {
            tab.state = state
        }
        if (type) {
            tab.type = type;
        }
        if (params) {
            tab.params = params;
        }
    }

    ctrl.editUser = function (userProxy) {
        ctrl.usernameInput = userProxy.item.name;
        ctrl.descriptionInput = userProxy.item.description;
        ctrl.emailInput = userProxy.item.email
        ctrl.editUserForm = true;
        ctrl.currentForm = 'Edit User';
        ctrl.selectedUserProxy = userProxy;
    };

    ctrl.addUser = function () {
        ctrl.usernameInput = '';
        ctrl.descriptionInput = '';
        ctrl.emailInput = '';
        ctrl.passwordInput = '';
        ctrl.confirmPasswordInput = '';
        ctrl.currentForm = "Add User";
        ctrl.addUserForm = true;
        
        // TODO This will need to move to new KoheseUser in the future
        ctrl.selectedUser = {};
        ctrl.selectedUser.item = {parentId: UserService.getUsersItemId()};
        ctrl.selectedUser.kind = "KoheseUser";
    };

    ctrl.cancelForm = function () {
        ctrl.addUserForm = false;
        ctrl.editUserForm = false;
        ctrl.selectedUser = null;
        ctrl.usernameInput = '';
        ctrl.descriptionInput = '';
        ctrl.emailInput = '';
        ctrl.passwordInput = '';
        ctrl.confirmPasswordInput = '';
        
    };

    // Will need another pass on this for security eventually for passwords
    function updateUserObject(userProxy) {
        userProxy.item.name = ctrl.usernameInput;
        userProxy.item.description = ctrl.descriptionInput;
        userProxy.item.email = ctrl.emailInput;

        // Test to see if the password has been changed and matches
        if (ctrl.passwordInput != '' && ctrl.passwordInput === ctrl.confirmPasswordInput) 
            {
            userProxy.item.password = ctrl.passwordInput;
            } // TO-DO Add error handling for invalid passwords and whatnot
    }

    ctrl.upsertUser = function () {
        if (ctrl.passwordInput == ctrl.confirmPasswordInput) {
            updateUserObject(ctrl.selectedUserProxy);
            ItemRepository.upsertItem(ctrl.selectedUserProxy).then(function (results) {
                    fetchUsers();
                });
            ctrl.cancelForm();

        } else {
            alert('Passwords do not match');
        }

    };

    ctrl.deleteUser = function (userProxy) {
        ItemRepository.deleteItem(userProxy).then(function() {
            fetchUsers();          
        });
    };
}


export default () => {
    angular.module('app.admin', ['app.services.tabservice'])
        .controller('AdminController', AdminController)
}