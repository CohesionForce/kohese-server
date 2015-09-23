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
        ctrl.currentForm = 'Edit User';
        ctrl.selectedUser = user;
        console.log(user);
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
        ctrl.editedUser = null;
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
            ctrl.addUserForm = false;
            ctrl.editUserForm = false;
            ctrl.editedUser = null;
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


}


export default () => {
    angular.module('app.admin', ['app.services.tabservice'])
        .controller('AdminController', AdminController)
}