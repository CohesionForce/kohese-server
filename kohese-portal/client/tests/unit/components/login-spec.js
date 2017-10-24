/**
 * New node file
 */

var MockLoginService = require('../mock/MockLoginService');
var MockKoheseIO = require('../mock/MockKoheseIO');

describe("Login Return", function() {

	var mockLoginService;
	var mockAuthTokenFactory;
	var callData;
	var state;
	var loginController;
	var mockLoginService = new MockLoginService();
	var mockKoheseIO = new MockKoheseIO();
	
	beforeEach(angular.mock.module('app.login'));

	beforeEach(function() {

		state = {
			go : function(data) {
				callData = data;
			}
		};

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
			LoginService : mockLoginService,
			KoheseIO : mockKoheseIO,
			AuthTokenFactory : mockAuthTokenFactory,
			$state : state
		});
	}));

	it("Check Login Pass", function() {
	    console.log('login-spec: Check Login Pass');
		loginController.login("user", "user123");
		expect(mockLoginService.username == "user").toBe(true);
		expect(mockLoginService.password == "user123").toBe(true);
		expect(mockAuthTokenFactory.data == "SomeData").toBe(true);
		expect(callData).toBe('kohese.explore')
	}),
	
	it("Check Logout", function() {
		console.log('login-spec: Check Logout');
		loginController.logout();
		expect(mockAuthTokenFactory.data).toBe(undefined);
	}),
	
	it("Check Login Fail", function() {
	    console.log('login-spec: Check Login Fail');
	    console.log(mockLoginService);
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