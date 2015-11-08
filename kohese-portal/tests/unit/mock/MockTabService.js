function MockTabService() {
    var service = this;
    
    this.tab = {
        title : undefined,
        type : undefined,
        state : undefined,
        setTitle : function(newTitle) {
            service.tab.title = newTitle;
        },
        params : {
            filter : "This is a filter",
            id : "mockTabService.tab.params.id"
        },
        setState : function(str) {
            service.tab.state = str;
        }
    };

    this.getTabId = function() {
        return "TabID";
    }
    
    this.getCurrentTab = function() {
        return service.tab;
    }

}

module.exports = MockTabService;