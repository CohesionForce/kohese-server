var MockItemRepository = require('../mock/MockItemRepository');
var MockActionService = require('../mock/MockActionService');
var MockUserService = require('../mock/MockUserService');
var MockVersionControlService = require('../mock/MockVersionControlService');

describe("Tree View",()=>{
    var treeCtrl;
    var VersionControlService;

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
                })

            inject(($injector, _$controller_, _$rootScope_, _$state_, 
                    _VersionControlService_)=>{
                $rootScope = _$rootScope_;
                $scope = $rootScope.$new();

                treeCtrl = _$controller_('KTreeController', {
                    $rootScope : $rootScope,
                    $scope : $scope,
                    $state : _$state_
                })

                VersionControlService = $injector.get('VersionControlService')
            })
            });

        it("tests the tree spec",()=>{
            console.log("Test");
            console.log(treeCtrl);
            console.log(VersionControlService);
        })

        
});