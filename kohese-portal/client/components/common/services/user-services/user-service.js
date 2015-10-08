/**
 * Created by josh on 10/8/15.
 */


function UserService(ItemRepository, $rootScope){

    const service = this;
    var users = [];

    service.getAllUsers = getAllUsers;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getTreeRoot();
        users = ItemRepository.getChildByNameFrom(root, 'Users').children;
    });

    function getAllUsers(){
       return users;
    }
}

export default () => {

    angular.module('app.services.userservice', ['app.services.itemservice'])
        .service('UserService', UserService);
}
