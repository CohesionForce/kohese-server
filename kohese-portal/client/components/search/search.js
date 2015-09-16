/**
 * Created by josh on 9/16/15.
 */

function SearchController(ItemRepository, tabService, $stateParams) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();

    ctrl.itemStore = ItemRepository.internalTree;
    ctrl.searchString = $stateParams.filter;

    ctrl.updateTab = function(itemId){
        tab.params.id = itemId;
    }

}


export default () => {

    angular.module('app.search', [
        'app.services.itemservice',
        'app.services.tabservice'])
        .controller('SearchController', SearchController)
}