function CommitModalControl($scope, Popeye){

    const ctrl = this;

    ctrl.msg = "I'm connected"
    ctrl.commitMessage = "";
    ctrl.indexedItems = {}

    ctrl.commit = function(){
        console.log("yo");
        console.log($scope)
        console.log(Popeye)
    }
    
}

function PushModalControl ($scope)
{
    const ctrl = this;
    ctrl.msg= "Push connected";

    ctrl.push = function()
    {
        console.log($scope);
    }

    
}


export default () => {
    angular.module("app.tree.modalcontrollers", [])
        .controller("PushModalControl", PushModalControl)
        .controller("CommitModalControl", CommitModalControl)
}