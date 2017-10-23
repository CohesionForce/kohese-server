function MockVersionControlService() {
    const service = this;
    service.indexedProxies = {};

    
    service.setIndexedProxy = function(proxy) {

    }

    service.getIndexedProxies = function() {

    }
    
    service.stageItems = function(proxyList) {

    }

    service.commitItems = function (proxyList, commitMessage) {

    }

    service.push = function(proxyIds, remoteName) {
        
    }

    service.addRemote = function(proxyId, remoteName, url) {

    }

    service.getRemotes = function(proxyId, callback) {

    }
}

module.exports = MockVersionControlService;