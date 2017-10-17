function MockItemRepository() {
    const service = this;
    var promiseMock = {then : function(fn) { fn()}}
    this.rootProxy = {
        item : {
            name : "Root",
            id   : "0"
        }
    }
 
    this.getAllItemProxies = function() {
        return [];
    };
    
    this.modelTypes = [];

    this.getRepositories = function() {
        return [];
    };
    
    this.getModelTypes = function() {
        this.modelTypes.empty = {modelName: ''};
        return this.modelTypes;
    };

    this.getRootProxy = function() {
        return {item: {},
                kind: 'Repository'}
    }

    this.deleteItem = function() {
        return promiseMock;
    }

    this.upsertItem = function(proxy) {
        return promiseMock;
    }
}



module.exports = MockItemRepository;