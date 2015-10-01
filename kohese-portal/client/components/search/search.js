/**
 * Created by josh on 9/16/15.
 */

function SearchController(ItemRepository, tabService, $state, $stateParams) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();

    ctrl.searchString = tab.params.filter;
    ctrl.itemList = ItemRepository.getAllItemProxies();

    if (ctrl.searchString !== '') {
    tab.setTitle('Search - ' + ctrl.searchString);
    } else {
        tab.setTitle('Search - All')
    };

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