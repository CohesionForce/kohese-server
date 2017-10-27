var MockUserService = require('../mock/MockUserService');
var MockItemRepository = require('../mock/MockItemRepository');
var MockToastr = require('../mock/third-party/MockToastr');
var MockKoheseIO = require('../mock/MockKoheseIO');

describe("Version Control Service",()=>{
    var service;
    var testProxyList = [{item:{id:"01"}},{item:{id:"02"}}];
    var testRemoteName = "test-remote";
    var testUrl = "/home/test-remote";
    var testRepoId = "TEST-REPO";
    var toastr;
    var KoheseIO;

    beforeEach(()=>{
        angular.mock.module('app.services.versioncontrolservice');

        angular.mock.module(($provide)=>{
            $provide.value('KoheseIO', new MockKoheseIO());
            $provide.value('UserService', new MockUserService());
            $provide.value('ItemRepository', new MockItemRepository);
            $provide.value('toastr', new MockToastr());
        })

        inject(($injector, _KoheseIO_, _toastr_)=>{
            service = $injector.get('VersionControlService');
            KoheseIO = _KoheseIO_;
            toastr = _toastr_;
        })
    });

    beforeEach(()=>{
        spyOn(toastr, 'error');
        spyOn(toastr, 'success');
    })

    it("returns an error toast when stage fails", (done)=>{
        service.stageItems(testProxyList);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        done();
    })

    it("returns an error toast when unstage fails", (done)=>{
        service.unstageItems(testProxyList);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        done();
    })

    it("returns an error toast when revert fails", (done)=>{
        service.revertItems(testProxyList);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        done();
    })

    it("returns an error toast when commit fails", (done)=>{
        service.commitItems(testProxyList);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        done();
    })
    it("returns an error toast when push fails", (done)=>{
        service.push(testProxyList, testRemoteName);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        done();
    })
    it("returns an error toast when add remote fails", (done)=>{
        service.addRemote(testRepoId, testRemoteName, testUrl);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        done();
    })
    it("returns an error toast when get remotes fails", (done)=>{
        this.passedInCallback = (results)=>{console.log(results);}
        spyOn(this, 'passedInCallback');
        service.getRemotes(testRepoId, this.passedInCallback);
        KoheseIO.resolveCallbacks("err");
        expect(toastr.error).toHaveBeenCalled();
        expect(this.passedInCallback).not.toHaveBeenCalled();;
        done();
    })
    // Success
    it("returns a success toast when stage succeeded ", (done)=>{
        service.stageItems(testProxyList);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        done();
    })

    it("returns a success toast when unstage succeeded ", (done)=>{
        service.unstageItems(testProxyList);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        done();
    })

    it("returns a success toast when revert succeeded ", (done)=>{
        service.revertItems(testProxyList);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        done();
    })

    it("returns a success toast when commit succeeded ", (done)=>{
        service.commitItems(testProxyList);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        done();
    })
    it("returns a success toast when push succeeded ", (done)=>{
        service.push(testProxyList, testRemoteName);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        done();
    })
    it("returns a success toast when add remote succeeded ", (done)=>{
        service.addRemote(testRepoId, testRemoteName, testUrl);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        done();
    })
    it("calls the passed in function when get remotes succeeds",(done)=>{
        this.passedInCallback = (results)=>{console.log(results);}
        spyOn(this,'passedInCallback');
        service.getRemotes(testRepoId, this.passedInCallback);
        KoheseIO.resolveCallbacks("success");
        expect(toastr.success).toHaveBeenCalled();
        expect(this.passedInCallback).toHaveBeenCalled();
        done();
    })
    

});





    