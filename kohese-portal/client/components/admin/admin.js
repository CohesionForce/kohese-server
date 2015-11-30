/**
 * Created by josh on 9/22/15.
 */

function AdminController(tabService, $state, $scope, KoheseUser, UserService, ItemRepository) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();


    ctrl.addUserForm = false;
    ctrl.editUserForm = false;
    ctrl.users = [];
    ctrl.sessions = UserService.sessions;
    ctrl.repositoryList = ItemRepository.getRepositories();

    console.log(ctrl.repositoryList)

    $scope.$on('$viewContentLoaded', function () {
        tab.setTitle('Admin');
        tab.type = 'singleview';
    });

    $scope.$on('itemRepositoryReady', function(){
        ctrl.repositoryList = ItemRepository.getRepositories();
        console.log(ctrl.repositoryList)
    });

    function fetchUsers() {
        KoheseUser.find().$promise.then(function (results) {
            ctrl.users = results;

        });
    }

    fetchUsers();


    ctrl.navigate = function (state, id) {
        if (state) {
            updateTab('kohese.explore.edit', 'dualview', {id: id})
            $state.go(state, {id: id})
        } else {
            updateTab('kohese.explore.edit', 'dualview', {id: id})
            $state.go('kohese.explore.edit', {id: id})
        }
    };

    function updateTab(state, type, params){
        if (state){
            tab.state = state
        } if (type){
            tab.type = type;
        } if (params) {
            tab.params = params;
        }
    }

    ctrl.editUser = function(user){
        ctrl.usernameInput = user.name;
        ctrl.descriptionInput = user.description;
        ctrl.editUserForm = true;
        ctrl.currentForm = 'Edit User';
        ctrl.selectedUser = user;
    };

    ctrl.addUser = function(){
        ctrl.usernameInput = '';
        ctrl.descriptionInput = '';
        ctrl.passwordInput = '';
        ctrl.confirmPasswordInput = '';
        ctrl.currentForm = "Add User";
        ctrl.addUserForm = true;
    };

    ctrl.cancelForm = function(){
        ctrl.addUserForm = false;
        ctrl.editUserForm = false;
        ctrl.selectedUser = null;
        ctrl.usernameInput = '';
        ctrl.descriptionInput = '';
        ctrl.passwordInput = '';
        ctrl.confirmPasswordInput = '';
    };

    function updateUserObject(user){
        user.name = ctrl.usernameInput;
        user.description = ctrl.descriptionInput;
        user.password = ctrl.passwordInput

    }

    ctrl.upsertUser = function () {
        if (ctrl.passwordInput == ctrl.confirmPasswordInput) {
            if(!ctrl.editUserForm){
                ctrl.selectedUser = new KoheseUser();
            }
            updateUserObject(ctrl.selectedUser);
            KoheseUser.upsert(ctrl.selectedUser)
                .$promise.then(function (results) {
                    fetchUsers();
                });
            ctrl.cancelForm();

        } else {
            alert('Passwords do not match');
        }

    };

    ctrl.deleteUser = function(user){
        KoheseUser.delete(user)
            .$promise.then(function(){
                fetchUsers();
            })
    };


}


export default () => {
    angular.module('app.admin', ['app.services.tabservice'])
        .controller('AdminController', AdminController)
}