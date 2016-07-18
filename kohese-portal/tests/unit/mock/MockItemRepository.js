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

}

module.exports = MockItemRepository;