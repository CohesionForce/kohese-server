function MockLoginService() {
    var service = this;
    
    // Variable that controls pass/fail
    this.pass = true;

    // User name should be the same value passed to the controller
    this.username = null;
    // Password should be the same value passed to the controller
    this.password = null;

    // login function called by the controller
    this.login = function(name, password) {
        console.log("mockLoginService.login called with " + name + ":"
                + password);
        this.username = name;
        this.password = password;
        
        // Return an object that works like a promise
        return {
            then : function(passFunction, failFunction) {
                if (service.pass) {
                    passFunction({
                        data : "SomeData"
                    });
                } else {
                    failFunction({
                        data : "Failed"
                    });
                }
            }
        }
    };
    
    this.setPassword = function(newValue) {
        this.pass = newValue;
    };
    
    this.getUsername = function() {
        return username;
    }
}

module.exports = MockLoginService;