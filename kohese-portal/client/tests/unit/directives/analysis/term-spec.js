var MockTabService = require('../../mock/MockTabService');

describe("Analysis Term Controller", ()=>{
    var controller;

    beforeEach(()=>{
        angular.mock.module('app.directives.termview')

        inject(($injector, _$rootScope_)=>{
            var _$scope_ = _$rootScope_.$new();
            var _tabService_ = new MockTabService();
            controller = $injector.get('$controller')('TermViewController', {
                tabService: _tabService_,
                $scope : _$scope_
            });
            })
        });

        
    it("should be defined", ()=>{
        expect(controller).toBeDefined();
    })
})