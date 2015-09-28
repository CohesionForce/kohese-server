/**
 * Created by josh on 9/16/15.
 */

function SearchController(ItemRepository, tabService, $state, $stateParams) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();

    ctrl.itemStore = ItemRepository.internalTree;
    ctrl.searchString = $stateParams.filter;
    ctrl.itemList = [];
    for(var key in ctrl.itemStore.proxyMap){
      ctrl.itemList.push(ctrl.itemStore.proxyMap[key]);
    }

    tab.setTitle('Search - ' + ctrl.searchString);

    if($stateParams.id){
        ctrl.currentItem = $stateParams.id;
    }

    ctrl.navigateToTree = function(){
        tab.setState('explore.edit');
        $state.go('kohese.explore.edit', {id: ctrl.currentItem})
    };

    ctrl.updateTab = function(itemId){
        tab.params.id = itemId;
        ctrl.currentItem = itemId;
        console.log(ctrl.currentItem)
    }

}


export default () => {

    angular.module('app.search', [
        'app.services.itemservice',
        'app.services.tabservice'])
        .controller('SearchController', SearchController)
}