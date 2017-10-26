function MockUserService() {

    const service = this;

    var currentUser = {
        item : { 
            name: "Mock user",
            id  : "0",
            description: "Mock User"
        }
    }

    service.users = {
        item : {
            name : "Users",
            id : "999"

        },
        children : [
            currentUser,
            { item: {
                name: "User 2",
                id  : "9"
                }
            }]
    }

    service.getUsersItemId = function() {
        return service.users.item.id;
    }
    
    service.getAllUsers = function() {
        return service.users.children;
    }
    
    service.getCurrentUsername = function() {
        return currentUser.item.name;
    }
}

module.exports = MockUserService;