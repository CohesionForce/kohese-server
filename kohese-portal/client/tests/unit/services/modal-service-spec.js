describe('Modal service', ()=>{
    var service;
    var $modal;

    var modalInstance = {
        result: {
            then: (confirmCallback, cancelCallback)=> {
                this.confirmCallback = confirmCallback;
                this.cancelCallback = cancelCallback
            }
        },
        close: (item)=> {
            this.result.confirmCallback (item);
        },
        dismiss: (type)=> {
            this.result.cancelCallback (type);
        }
    }

    var mock$modal = {
        open : (defaults)=>{}
        }

    beforeEach(()=> {
        angular.mock.module('app.services.modalservice');

        angular.mock.module(($provide)=> {
            $provide.value('$modal', mock$modal);
            $provide.service('_ModalService_')
        })

        inject(($injector, _$modal_)=> {
            service = $injector.get('ModalService');
            console.log(service);
            $modal = _$modal_;
        });
    });

    it('can launch a modal', (done)=>{
       spyOn($modal, 'open').and.returnValue(modalInstance);
       service.show({},{})
       expect($modal.open).toHaveBeenCalled();
       done();
    })
})