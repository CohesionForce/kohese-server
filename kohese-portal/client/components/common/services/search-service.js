/**
 * Created by josh on 10/22/15.
 */

function SearchService(){
    const service = this;
    var filterList = {};

    service.getFilterObject = getFilterObject;
    service.setFilterObject = setFilterObject;

    function setFilterObject(object, id){
        filterList[id] = object;
    }
    function getFilterObject(id){
        return filterList[id]
    }
}

export default () => {

    angular.module('app.services.searchservice', [])
        .service('SearchService', SearchService);
}