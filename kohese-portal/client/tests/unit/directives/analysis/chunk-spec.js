var MockTabService = require('../../mock/MockTabService');

describe("Analysis Chunk Controller", ()=>{
    var controller;

    beforeEach(()=>{
        angular.mock.module('app.directives.chunkview')

        inject(($injector,_$rootScope_)=>{
            var _$scope_ = _$rootScope_.$new();
            var _tabService_ = new MockTabService();

            controller = $injector.get('$controller')('ChunkViewController',{
                tabService: _tabService_,
                $scope : _$scope_
                });
            })
        });

        
    it("should be defined", ()=>{
        expect(controller).toBeDefined();
    })
})