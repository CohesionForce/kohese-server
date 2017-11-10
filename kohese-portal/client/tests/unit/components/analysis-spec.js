var MockItemRepository = require('../mock/MockItemRepository');
var MockTabService = require('../mock/MockTabService');

describe('Analysis Controller', ()=>{
  var controller;


  beforeEach(()=>{
    angular.mock.module('app.components.analysis')

    inject(($injector, _$rootScope_)=>{
      var _$scope_ = _$rootScope_.$new();
      var _ItemRepository_ = new MockItemRepository();
      var _tabService_ = new MockTabService();

      controller = $injector.get('$controller')('AnalysisController', {
        $scope: _$scope_,
        $stateParams : {id: '01'},
        ItemRepository : _ItemRepository_,
        tabService : _tabService_
      });
    })
  })
        
  it('should be defined', ()=>{
    expect(controller).toBeDefined();
  })
})