/**
 * Created by josh on 9/22/15.
 */

function AdminController(tabService, $scope, KoheseUser) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();


    ctrl.addUserForm = false;
    ctrl.users = [];

    $scope.$on('$viewContentLoaded', function () {
        tab.setTitle('Admin');
        tab.type = 'singleview';
    });

    function fetchUsers() {
        KoheseUser.find().$promise.then(function (results) {
            ctrl.users = results;

        });
    }

    fetchUsers();


    ctrl.editUser = function(user){
        ctrl.usernameInput = user.name;
        ctrl.descriptionInput = user.description;
        ctrl.editUserForm = true;
        ctrl.currentForm = 'Edit User'
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
    };

    ctrl.upsertUser = function () {
        if (ctrl.passwordInput == ctrl.confirmPasswordInput) {
            KoheseUser.upsert({
                name: ctrl.usernameInput,
                description: ctrl.descriptionInput,
                password: ctrl.passwordInput
            }).$promise.then(function (results) {
                    fetchUsers();
                });
            ctrl.addUserForm = false;
            ctrl.editUserForm = false;
            ctrl.usernameInput = '';
            ctrl.descriptionInput = '';
            ctrl.passwordInput = '';
            ctrl.confirmPasswordInput = '';
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

    ctrl.title = 'Admin Controller';

}


export default () => {
    angular.module('app.admin', ['app.services.tabservice'])
        .controller('AdminController', AdminController)
}