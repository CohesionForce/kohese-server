var MockItemRepository = require('../mock/MockItemRepository');
var MockActionService = require('../mock/MockActionService');
var MockUserService = require('../mock/MockUserService');
var MockVersionControlService = require('../mock/MockVersionControlService');

describe('Tree View',()=>{
  var treeCtrl;
  var VersionControlService;
  var $rootScope;
  var DeleteTemplate;
  var testProxy = {
    item: {
      id: '01',
      name: 'Childless Proxy'
    },
    children: []
  }
  var testParentProxy = {
    item: {
      id: '02',
      name: 'Parent Proxy'
    },
    children: [{
      item: {
        id: '03',
        name: 'Child Proxy'
      }
    }]
  }

  beforeEach(()=>{
    angular.mock.module(require('angular-ui-router'));
  })
    
  beforeEach(()=>{
    angular.mock.module('app.tree');

    angular.mock.module(($provide)=>{
      // Mock out the modules trying to make external calls for now
      $provide.value('UserService', new MockUserService());
      $provide.value('VersionControlService', 
        new MockVersionControlService());
      $provide.value('ItemRepository', new MockItemRepository());
    })

    inject(($injector, _$controller_, _$rootScope_, 
      _VersionControlService_, _ItemRepository_)=>{
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();

      treeCtrl = _$controller_('KTreeController', {
        $rootScope : $rootScope,
        $scope : $scope,
      })

      VersionControlService = $injector.get('VersionControlService')
      ItemRepository = $injector.get('ItemRepository');
      ModalService = $injector.get('ModalService');
      DeleteTemplate = $injector.get('DeleteTemplate');
    })
  });

  it('tests the tree spec',()=>{
    console.log('Test');
    console.log(treeCtrl);
    console.log(VersionControlService);
  })

  describe('Delete Item', ()=>{
    var deferred1;
    var deferred2;
    var defaultParentModalOptions = {
      closeButtonText : 'Cancel',
      actionButtonText : 'Delete',
      headerText: 'Delete "' + testParentProxy.item.name + '"?',
      bodyText: 'Are you sure you want to delete this item?'
    }
    var defaultSingleModalOptions = {
      closeButtonText : 'Cancel',
      actionButtonText : 'Delete',
      headerText: 'Delete "' + testProxy.item.name + '"?',
      bodyText: 'Are you sure you want to delete this item?'
    }

    beforeEach(()=>{         
      inject((_$q_)=>{
        deferred1 = _$q_.defer();
        deferred2 = _$q_.defer();
        spyOn(ModalService, 'showModal')
          .and.callFake(()=>{
            return deferred1.promise;
          });
        spyOn(ItemRepository, 'deleteItem')
          .and.callFake(()=>{
            return deferred2.promise;
          });
      });
    });

    it('shows a modal asking the user to confirm deletion of one item', 
      (done)=>{
        treeCtrl.removeItem(testProxy);
        deferred1.resolve({});
        $rootScope.$digest();
        expect(ModalService.showModal)
          .toHaveBeenCalledWith({}, defaultSingleModalOptions)
        deferred2.resolve({id: '01'});
        $rootScope.$digest();
        expect(ItemRepository.deleteItem).toHaveBeenCalled();
        done();
      })
    it('shows a modal with options for recursive delete of item and children', 
      (done)=>{
        treeCtrl.removeItem(testParentProxy);
        deferred1.resolve({deleteChildren:true});
        $rootScope.$digest();
        expect(ModalService.showModal)
          .toHaveBeenCalledWith({templateUrl: DeleteTemplate},
            defaultParentModalOptions);
        deferred2.resolve({id: '02'});
        $rootScope.$digest();
        expect(ItemRepository.deleteItem).toHaveBeenCalledWith(testParentProxy, true);
        done();
      })
  })

  describe('Version Control', ()=>{
    var newStagedItemProxy;
    var newUnstagedItemProxy;
    var modifiedStagedItemProxy;
    var modifiedUnstagedItemProxy;
    var deferred;

    beforeEach(()=>{
      newStagedItemProxy = {
        item: {
          id: '02',
          name: 'New Proxy'
        },
        vcState: {
          Staged: 'New'
        }
      }
      newUnstagedItemProxy = {
        item: {
          id: '03',
          name: 'New Unstaged Item Proxy'
        },
        vcState: {
          Unstaged: 'New'
        }
      }
      modifiedStagedItemProxy = {
        item: {
          id: '04',
          name: 'Modified Staged Item Proxy'
        },
        vcState: {
          Staged: 'Modified'
        }
      }
      modifiedUnstagedItemProxy = {
        item: {
          id: '05',
          name: 'Modified Unstaged Item Proxy'
        },
        vcState: {
          Unstaged: 'Modified'
        }
      }
    })

    it('signals the server to stage an item', (done) => {
      spyOn(VersionControlService, 'stageItems');
      treeCtrl.stageItem(newUnstagedItemProxy);
      expect(VersionControlService.stageItems)
        .toHaveBeenCalledWith([newUnstagedItemProxy]);
      done();
    })
    it('signals the server to unstage an item', (done) => {
      spyOn(VersionControlService, 'unstageItems');
      treeCtrl.unstageItem(newUnstagedItemProxy);
      expect(VersionControlService.unstageItems)
        .toHaveBeenCalledWith([newUnstagedItemProxy]);
      done();
    })

    describe('revert',()=>{
      var deferred1;
      var deferred2;

      beforeEach(()=>{         
        inject((_$q_)=>{
          deferred1 = _$q_.defer();
          deferred2 = _$q_.defer();
          spyOn(ModalService, 'showModal')
            .and.callFake(()=>{
              return deferred1.promise;
            });
          spyOn(ItemRepository, 'deleteItem')
            .and.callFake(()=>{
              return deferred2.promise;
            });
        });
      });
           
      it('deletes a new unstaged item when revert is called on it', (done)=>{
        treeCtrl.revertItem(newUnstagedItemProxy);
        deferred1.resolve({itemId: '01'});
        $rootScope.$digest();
        deferred2.resolve({itemId:'01'});
        $rootScope.$digest();
                    
        expect(ItemRepository.deleteItem)
          .toHaveBeenCalledWith(newUnstagedItemProxy);
        done();
      })

      it('deletes a new staged item when revert is called on it', (done)=>{
        treeCtrl.revertItem(newStagedItemProxy);
        deferred1.resolve({itemId: '01'});
        $rootScope.$digest();
        deferred2.resolve({itemId:'01'});
        $rootScope.$digest();
                    
        expect(ItemRepository.deleteItem)
          .toHaveBeenCalledWith(newStagedItemProxy);
        done();  
      })

      it('signals the server to revert a modified staged item', (done)=>{
        spyOn(VersionControlService, 'revertItems');
        treeCtrl.revertItem(modifiedStagedItemProxy);
        deferred1.resolve({});
        $rootScope.$digest();

        expect(VersionControlService.revertItems)
          .toHaveBeenCalledWith([modifiedStagedItemProxy]);
        done();
      })
      it('signals the server to revert an modified unstaged item', (done)=>{
        spyOn(VersionControlService, 'revertItems');
        treeCtrl.revertItem(modifiedUnstagedItemProxy);
        deferred1.resolve({});
        $rootScope.$digest();
                    
        expect(VersionControlService.revertItems)
          .toHaveBeenCalledWith([modifiedUnstagedItemProxy]);
        done();
      })
    })
  })
});