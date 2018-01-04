var MockTabService = require('../../mock/MockTabService');

describe("Analysis Term Controller", ()=>{
    var controller;

    beforeEach(()=>{
        angular.mock.module('app.directives.termview')

        inject(($injector, _$rootScope_)=>{
            var _$scope_ = _$rootScope_.$new();
            var _tabService_ = new MockTabService();
            var _analysisService = new MockAnalysisService();
            controller = $injector.get('$controller')('TermViewController', {
                tabService: _tabService_,
                analysisService : _analysisService;
                $scope : _$scope_
            });
            })
        });

        
    it("should be defined", ()=>{
        expect(controller).toBeDefined();
    })
    describe("sort", ()=>{
        it('should start with ascending sort on count', ()=>{
            expect(ctrl.reverse).toBe(false);
            expect(ctrl.sortField).toBe(['-count', '-text'])
        })
        it('should be able to take a new sort field', ()=>{
            ctrl.newSort('-text');
            expect(ctrl.sortField).toBe('-text');
            expect(ctrl.reverse).toBe(false);
        })
        it('should be able to sort in reverse', ()=>{
            ctrl.newSort('-text');
            ctrl.newSort('-text');
            expect(ctrl.sortField).toBe('-text');
            expect(ctrl.reverse).toBe(true);
        })
    })
})