function MockItemRepository() {
  const service = this;
  var promiseMock = {then : function(fn) {
    fn()
  }}
  this.rootProxy = {
    item : {
      name : 'Root',
      id   : '0'
    },
    getChildByName: ()=>{
      return; 
    }
  }
 
  this.getAllItemProxies = function() {
    return [];
  };

  this.getProxyFor = function(id) {
    return {
      item: {
        id: id,
        name: 'Mock Proxy'
      },
      children: [

      ]
    }
  }
    
  this.modelTypes = [];

  this.getRepositories = function() {
    return [];
  };
    
  this.getModelTypes = function() {
    this.modelTypes.empty = {modelName: ''};
    return this.modelTypes;
  };

  this.getRootProxy = function() {
    return this.rootProxy;
  }

  this.deleteItem = function() {
    return Promise.resolve({itemId:'01'});
  }

  this.upsertItem = function(proxy) {
    return promiseMock;
  }
}



module.exports = MockItemRepository;