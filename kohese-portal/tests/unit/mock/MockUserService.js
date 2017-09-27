function MockUserService() {
    
    this.user = {
            name : 'user'
    }
    
    this.getAllUsers = function() {
        return [];
    }
    
    this.getCurrentUsername = function() {
        return user;
    }
}

module.exports = MockUserService;