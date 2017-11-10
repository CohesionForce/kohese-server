function MockVersionControlService() {
  const service = this;
    
  service.stageItems = function(proxyList) {

  }

  service.unstageItems = function(proxyList) {

  }

  service.commitItems = function (proxyList, commitMessage) {

  }

  service.revertItems = function(proxyList) {
        
  }

  service.push = function(proxyIds, remoteName) {
        
  }

  service.addRemote = function(proxyId, remoteName, url) {

  }

  service.getRemotes = function(proxyId, callback) {
    callback(['test-remote', 'master'])
  }
}

module.exports = MockVersionControlService;