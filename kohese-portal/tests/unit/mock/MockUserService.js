function MockUserService() {
    
    this.user = {
            name : 'user'
    }
    
    this.getAllUsers = function() {
        return [];
    }
    
    this.getCurrentUser = function() {
        return user;
    }
}

module.exports = MockUserService;