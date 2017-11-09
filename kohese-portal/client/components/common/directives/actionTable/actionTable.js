/*
    Directive used to represent an item's children in the manner of a burndown chart. 
    Receives a proxy as input and requires nothing view-specific in order to be instantiated

    Pass in the proxy with the item-proxy attribute from the enclosing html layer

    Created by Josh Phillips 
*/

const ASCENDING_SORT = 1;
const DESCENDING_SORT = 2;

function ActionTableController($scope) {      
    ////////////////// TEMPORARY ////////////////////////////////////
    // Set up base field object - temporary /////////////////////////
    // When we get the generic types from the servr this will be pulled from
    // that service.
    this.fields = [
        {title: 'Name', key: 'name', onProxy: false, primary: true},
        {title: 'State', key: 'actionState', onProxy: false},
        {title: 'Assigned To', key: 'assignedTo', onProxy: false},
        {title: 'Kind', key: 'kind', onProxy: true}
        // {title: 'Due', key: 'dueBy', onProxy: false}
    ]
    /////////////////////////////////////////////////////////////////

    ///////////////////////// Setup /////////////////////////////////

    // Underscore is not injected through angular DI
    var _ = require('underscore');

    // Copy scope variables into controller
    this.itemProxy = $scope.itemProxy;
    this.proxyCollection = [];
    this.sortedFieldKey = '';
    this.sortDirection;
    this.sortable = true;
    console.log(this.itemProxy);

    

    
    // Filter items down to relevant kinds, may need update to use 
    // generic kind definitions in the future
    this.proxyCollection = this.itemProxy
                            .getDescendants()
                            .filter(function(proxy) {
                if (proxy.kind == 'Action' || proxy.kind == 'Task') {
                    return proxy;
                    }
                });
    
    // Array does not exist, is not an array, or is empty
    if (!Array.isArray(this.proxyCollection) || !this.proxyCollection.length) {
        this.actionsFound = false;
    }
    else
        this.actionsFound = true;
    
    //Logging, remove before commit
    console.log(this.proxyCollection);

    
    /////////////////////////// Function Definitions /////////////////////////////

    this.sortTable = function(array,sortKey) {
        // If a new sort field has been selected
        if(sortKey != this.sortedFieldKey) {
            this.sortedFieldKey = sortKey;
            this.sortDirection = ASCENDING_SORT;
        }
        else {
            this.sortDirection = this.sortDirection == ASCENDING_SORT ? DESCENDING_SORT : ASCENDING_SORT;
        }

        console.log(this.proxyCollection);
        this.proxyCollection = sort(array, sortKey, this.sortDirection);
        console.log(this.proxyCollection);
    }

    // SORTING SERVICE FUNCTIONS - WILL MOVE
    function sort(array, sortKey, direction) {
        var sortedArray = array.slice(0)
                        .sort(alphabeticalComparison(sortKey))
        
        if (direction == DESCENDING_SORT) {
            return sortedArray.reverse();
        }
        
        return sortedArray;
    }

    // Generates a comparison function for the entered sort key
    // move to lower case TBD
    function alphabeticalComparison (sortKey) {
        return function(a,b) { 
            if(a.item[sortKey]) {
                var nameA = a.item[sortKey].toLowerCase(); // ignore upper and lowercase
            }
        
            if(b.item[sortKey]) {
                var nameB = b.item[sortKey].toLowerCase(); // ignore upper and lowercase
            }

            // If one of the items has an empty field, choose the defined field
            if (!nameA && nameB) {
                return  1;
            }
            
            if (nameA && !nameB) {
                return -1;
            }

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            // If names are equal
            return 0;
        }
    }
}
        

function ActionTable() {
    return {
        restrict: 'EA',
        scope: {
            itemProxy : '='
        },
        templateUrl: 'components/common/directives/actionTable/actionTable.html',
        controller: ActionTableController
        }
    }

export default () => {
  angular.module('app.directives.actiontable', [])
  .directive('actionTable', ActionTable)
  .controller('ActionTableController', ['$scope', ActionTableController]);
}