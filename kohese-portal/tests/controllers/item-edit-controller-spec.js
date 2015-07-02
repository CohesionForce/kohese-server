/**
 * Created by josh on 6/30/15.
 */

//describe("ItemEditController", function () {
//    var $rootScope,
//        $scope,
//        controller,
//        $compile,
//        testItem = {
//        title: "Test title",
//        description: "This is a test",
//        id: "Test+ID",
//        parentId: "null"
//    };
//
//    beforeEach(function () {
//        angular.mock.module('app');
//
//        inject(function ($injector, $controller, _$compile_) {
//            $rootScope = $injector.get('$rootScope');
//            $scope = $rootScope.$new();
//            controller = $controller("ItemEditController", {$scope: $scope});
//            $compile = _$compile_;
//        });
//
//    });
//
//    describe("Event Handlers", function(){
//
//        describe("editItem", function() {
//
//            it("Should set defaultTab.active to true", function(){
//                $scope.defaultTab.active = false;
//                $rootScope.$broadcast('editItem', testItem.id);
//                $scope.tree.proxyMap
//                expect($scope.defaultTab.active).toBeTruthy();
//            })
//        })
//    })
//
//
//});