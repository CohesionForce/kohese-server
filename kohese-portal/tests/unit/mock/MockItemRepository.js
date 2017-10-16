function MockItemRepository() {
 
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
        return {then : function(fn) { fn()}}};
}



module.exports = MockItemRepository;