/**
 * Created by josh on 9/22/15.
 */

<<<<<<< HEAD
function AdminController(tabService, $state, $scope, UserService, ItemRepository, 
                         SessionService, $rootScope, VersionControlService, $window) {
=======
function AdminController(tabService, $state, $scope, UserService, ItemRepository,
                        SessionService) {
>>>>>>> 424f9a301b745e31c0dc0d61b42bb686ef4d19a9
    var ctrl = this;
    var tab = tabService.getCurrentTab();
    var controllerRestored = tabService.restoreControllerData(tab.id, 'adminCtrl', this);
    var treeRoot = ItemRepository.getRootProxy()

    if (!controllerRestored) {
        ctrl.addUserForm = false;
        ctrl.editUserForm = false;
        ctrl.users = [];
        ctrl.sessions = SessionService.sessions;
<<<<<<< HEAD

    }

=======
        ctrl.repositoryList = ItemRepository.getRepositories();
    }

>>>>>>> 424f9a301b745e31c0dc0d61b42bb686ef4d19a9
    $scope.$on('$viewContentLoaded', function () {
        tab.setTitle('Admin');
        tab.type = 'singleview';
    });

    /* This handles if the user is coming to the screen for the first time */
    $scope.$on('itemRepositoryReady', function () {
        ctrl.repositoryList = ItemRepository.getRepositories();
        ctrl.treeRoot = ItemRepository.getRootProxy();
        fetchUsers();

    });

    $scope.$on('tabSelected', function () {
        tabService.bundleController(ctrl, 'adminCtrl', tab.id);
    });

    function fetchUsers() {
        ctrl.users = UserService.getAllUsers();
    }

    fetchUsers();

    ctrl.navigate = function (state, type, id) {
        if (state) {
            updateTab(state, type, { id: id });
            $state.go(state, { id: id });
        }
    };

    function updateTab(state, type, params) {
        if (state) {
            tab.state = state;
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
<<<<<<< HEAD
        ctrl.emailInput = userProxy.item.email;
=======
        ctrl.emailInput = userProxy.item.email
>>>>>>> 424f9a301b745e31c0dc0d61b42bb686ef4d19a9
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
        ctrl.selectedUser.item = { parentId: UserService.getUsersItemId() };
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
<<<<<<< HEAD
        if (ctrl.passwordInput != '' && ctrl.passwordInput === ctrl.confirmPasswordInput) {
            userProxy.item.password = ctrl.passwordInput;
        } // TO-DO Add error handling for invalid passwords and whatnot
=======
        if (ctrl.passwordInput != '' && ctrl.passwordInput === ctrl.confirmPasswordInput) 
            {
            userProxy.item.password = ctrl.passwordInput;
            } // TO-DO Add error handling for invalid passwords and whatnot
>>>>>>> 424f9a301b745e31c0dc0d61b42bb686ef4d19a9
    }

    ctrl.upsertUser = function () {
        if (ctrl.passwordInput == ctrl.confirmPasswordInput) {
            updateUserObject(ctrl.selectedUserProxy);
<<<<<<< HEAD
            console.log(ctrl.selectedUserProxy);
            ItemRepository.upsertItem(ctrl.selectedUserProxy).then(function (results) {
                fetchUsers();
                $rootScope.$broadcast('UserUpdated', ctrl.selectedUserProxy)
            });
=======
            ItemRepository.upsertItem(ctrl.selectedUserProxy).then(function (results) {
                    fetchUsers();
                });
>>>>>>> 424f9a301b745e31c0dc0d61b42bb686ef4d19a9
            ctrl.cancelForm();
        } else {
            alert('Passwords do not match');
        }
    };

    ctrl.deleteUser = function (userProxy) {
        ItemRepository.deleteItem(userProxy).then(function () {
            fetchUsers();
        });
    };
<<<<<<< HEAD

    /* Version Control Functions */

    ctrl.addRemote = function(){
        if(ctrl.remoteNameInput != "" && ctrl.remoteUrlInput != "")
        {
        VersionControlService.addRemote([treeRoot.children[0].item.id], 
            ctrl.remoteNameInput, ctrl.remoteUrlInput);
        } else {
            $window.alert("Please enter a name and url");
        }
    }

    ctrl.getRemotes = function(){
        console.log(treeRoot.children[0]);  
        VersionControlService.getRemotes(treeRoot.children[0].item.id, 
            function(remoteList) {
            ctrl.remotesList = remoteList;
            });

        console.log(ctrl.remotesList);
    }

    ctrl.commit = function()
        {
        if (ctrl.commitMessageInput === "")
            treeCtrl.commitMessageInput = "No Message Entered"
=======
}
>>>>>>> 424f9a301b745e31c0dc0d61b42bb686ef4d19a9

        // Need to grab all of the indexed nodes
        VersionControlService.commitItems(treeRoot.children[0],
                                        ctrl.commitMessageInput);
        }

    ctrl.push = function() 
    {
        // Using the root nodes repo for now while that system gets worked out.
        var proxyIds = []
        proxyIds.push(treeRoot.children[0].item.id);
        VersionControlService.push(proxyIds, ctrl.pushRemoteNameInput);
    }
        
}

export default () =>
{
    angular.module('app.admin', ['app.services.tabservice', 
                                 'app.services.sessionservice',
                                 'app.services.versioncontrolservice'])
           .controller('AdminController', AdminController);
}