/* Created by Josh */

function VersionControlService(KoheseIO, UserService , $rootScope, ItemRepository, toastr)
{
    const service = this;
    service.versionStatusMap = {
        "STATUS.CURRENT"  : [],	
        "INDEX_NEW"	      : [], 
        "INDEX_MODIFIED"  : [],
        "INDEX_DELETED"	  : [],
        "INDEX_RENAMED"	  : [],
        "INDEX_TYPECHANGE": [],
        "WT_NEW"	      : [],
        "WT_MODIFIED"    :  [],
        "WT_DELETED"      : [],
        "WT_TYPECHANGE"	  : [],
        "WT_RENAMED"      : [],
        "WT_UNREADABLE"   : [],
        "IGNORED"         : [],
        "CONFLICTED"      : []
    }
    service.gitStatusMap = {};

    $rootScope.$on('ItemRepositoryReady', 
        function () {
            InitializeService();
            });

    $rootScope.$on('Version Control Status Updated', 
        function (gitStatusMap)
            {
            UpdateVersionStatusMap(gitStatusMap);
            });

    $rootScope.$on('Version Control Node Updated', function(notification)
    {
        
        service.versionStatusMap[notification.status].push(notification.id)
    });
    
    service.stageItems = function(proxyIds) {
        console.log (proxyIds);
        var data = {proxyIds: Array.from(proxyIds)}
        console.log("StageItems");
        console.log(data);
        KoheseIO.socket.emit('VersionControl/add', data, function (results) {
            if (results.error)
            toastr.error('Stage Failed', 'Version Control');
            else {
            toastr.success('Stage Succeeded!', 'Version Control');
            }
            console.log("::: Stage results:");
            console.log(results);
          });
    }

    service.commitItems = function (proxyIds, commitMessage) {
        var data = {};
        data.proxyIds = Array.from(proxyIds);
        data.username = UserService.getCurrentUsername();
        data.email = UserService.getCurrentUserEmail();
        data.message = commitMessage;
        console.log("Commit Data");
        console.log(data);
        KoheseIO.socket.emit('VersionControl/commit', data, function (results) {
            if (results.error)
                toastr.error('Commit Failed', 'Version Control');
            else {
                toastr.success('Commit Succeeded!', 'Version Control');
                }
            console.log("::: Commit results:");
            console.log (results);
        });
    }

    function InitializeService() 
        {   
        var root = ItemRepository.getRootProxy()
        // If Repository isn't loaded, cancel the init
        if (!root)
            return;
            
        console.log("Initial Load : VCS");
        KoheseIO.socket.emit('Item/getStatus', {repoId: root.item.id}, 
            function (gitStatusMap) 
            {
                UpdateVersionStatusMap(gitStatusMap);
            });
        }; 

    function UpdateVersionStatusMap(gitStatusMap)
        {
        
        console.log("VCS GitStatus Update");
        console.log(gitStatusMap);

        for (var i = 0; i < gitStatusMap.length; i++) {
            var currentNode = gitStatusMap[i];
            for (var statusI = 0; statusI < currentNode.status.length; statusI++)
                {
                var key = currentNode.status[statusI];
                service.versionStatusMap[key].push(currentNode.id);
                }
            }

        console.log("UpdateVersionStatusMap Complete");
        console.log(service.versionStatusMap);
        }
        
    // Execution 
    InitializeService();
    }

export default () => {

    angular.module('app.services.versioncontrolservice', ['app.factories.koheseio', 'toastr'])
        .service('VersionControlService', VersionControlService);
}