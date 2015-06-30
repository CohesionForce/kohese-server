/**
 * Created by josh on 6/30/15.
 */

describe("ItemEditController", function () {
    var $rootScope,
        $scope,
        controller;

    beforeEach(function () {
        angular.mock.module('app');

        inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            controller = $injector.get('$controller')("ItemController", {$scope: $scope});
        });
    });

    describe("Event Handlers", function(){

        describe("Default Tab", function() {

            it("Should reset to the default tab when a new item loads", function(){
                $rootScope.emit('editItem');
                var defaultTab = angular.element("#defaultTab");
                var scope = defaultTab.isolateScope();
                expect(scope.active).toBeTruthy();
            })
        })
    })
});