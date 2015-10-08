/**
 * Created by josh on 10/7/15.
 */

function CategoryService(ItemRepository, $rootScope){
    const service = this;
    var users = [];

    service.getTags = getTags;
    service.getTagNames = getTagNames;

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getTreeRoot();
        users = ItemRepository.getChildByNameFrom(root, 'Users').children;
    });

    function getTags(){
        return users;
    }

    function getTagNames(){
        var tagNames = [];
        for (var x = 0; x < users.length; x++){
            tagNames.push(users[x].item.name);
        }
        return tagNames;
    }

}

export default () => {

    angular.module('app.services.categoryservice', [
        'app.services.itemservice'
    ])
        .service('CategoryService', CategoryService)
}