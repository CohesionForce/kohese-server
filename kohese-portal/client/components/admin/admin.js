/**
 * Created by josh on 9/22/15.
 */

function AdminController(tabService, $state, $scope, UserService, ItemRepository) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(tab.id, 'adminCtrl', this);

    if (!controllerRestored) {
        ctrl.addUserForm = false;
        ctrl.editUserForm = false;
        ctrl.users = [];
        ctrl.sessions = UserService.sessions;
        ctrl.repositoryList = ItemRepository.getRepositories();
    }


    $scope.$on('$viewContentLoaded', function () {
        tab.setTitle('Admin');
        tab.type = 'singleview';
    });

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
        ctrl.usernameInput = userProxy.name;
        ctrl.descriptionInput = userProxy.description;
        ctrl.editUserForm = true;
        ctrl.currentForm = 'Edit User';
        ctrl.selectedUser = user;
    };

    ctrl.addUser = function () {
        ctrl.usernameInput = '';
        ctrl.descriptionInput = '';
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
        ctrl.passwordInput = '';
        ctrl.confirmPasswordInput = '';
    };

    function updateUserObject(userProxy) {
        userProxy.item.name = ctrl.usernameInput;
        userProxy.item.description = ctrl.descriptionInput;
        userProxy.item.password = ctrl.passwordInput
    }

    ctrl.upsertUser = function () {
        if (ctrl.passwordInput == ctrl.confirmPasswordInput) {
            updateUserObject(ctrl.selectedUser);
            ItemRepository.upsertItem(ctrl.selectedUser).then(function (results) {
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