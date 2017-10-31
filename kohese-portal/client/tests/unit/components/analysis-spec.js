describe("Analysis Controller", ()=>{
    var controller;

    beforeEach(()=>{
        angular.mock.module('Analysis Controller')

        inject(($injector)=>{
            controller = $injector.$get('AnalysisController');
            })

        
    it("should be defined", ()=>{
        expect(controller).toBeDefined();
    })
    })
})