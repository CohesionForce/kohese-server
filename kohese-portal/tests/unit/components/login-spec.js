/**
 * New node file
 */
describe("Login Return", function() {

	var mockLoginService;
	var mockAuthTokenFactory;
	var callData;
	var state;
	var loginController;

	beforeEach(module('app.login'));

	beforeEach(function() {

		state = {
			go : function(data) {
				callData = data;
			}
		};

		// Set up the Mock Login Service
		mockLoginService = {

			// Variable that controls pass/fail
			pass : true,

			// User name should be the same value passed to the controller
			username : null,
			// Password should be the same value passed to the controller
			password : null,

			// login function called by the controller
			login : function(name, password) {
				console.log("mockLoginService.login called with " + name + ":"
						+ password);
				this.username = name;
				this.password = password;
				
				// Return an object that works like a promise
				return {
					then : function(passFunction, failFunction) {
						if (mockLoginService.pass) {
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
			}
		}, 
		
		// Mock Authorization Token Factory
		mockAuthTokenFactory = {
			data : undefined,
			setToken : function(token) {
				this.data = token;
			}
		}
	});

	beforeEach(inject(function($controller) {
		loginController = $controller('LoginController', {
			loginService : mockLoginService,
			AuthTokenFactory : mockAuthTokenFactory,
			$state : state
		});
	}));

	it("Check Login Pass", function() {
		loginController.login("user", "user123");
		expect(mockLoginService.username == "user").toBe(true);
		expect(mockLoginService.password == "user123").toBe(true);
		expect(mockAuthTokenFactory.data == "SomeData").toBe(true);
		expect(callData).toBe('kohese.explore')
	}),
	
	it("Check Logout", function() {
		console.log("Calling loginController.logout()");
		loginController.logout();
		expect(mockAuthTokenFactory.data).toBe(undefined);
	}),
	
	it("Check Login Fail", function() {
		mockLoginService.pass = false;
		callData = undefined;
		spyOn(window, 'alert');
		loginController.login("failUser", "failUser123");
		expect(window.alert).toHaveBeenCalledWith('Error: Failed');
		expect(mockLoginService.username == "failUser").toBe(true);
		expect(mockLoginService.password == "failUser123").toBe(true);
		expect(callData).toBe(undefined);
		expect(mockAuthTokenFactory.data).toBe(undefined);
	})
});

describe("suite name", function() {
});