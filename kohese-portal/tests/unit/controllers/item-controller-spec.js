/**
 * Created by josh on 6/30/15.
 */
describe("ItemController", function(){
    var $rootScope,
        $scope,
        controller;

    beforeEach(function(){
        module('app');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            controller = $injector.get('$controller')("ItemController", {$scope: $scope});
        });
    });
});