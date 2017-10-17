/**
 * New node file
 */

var MockTabService = require('../mock/MockTabService');
var MockUserService = require('../mock/MockUserService');
var MockState = require('../mock/MockState');
var MockItemRepository = require('../mock/MockItemRepository');
var MockVersionControlService = require('../mock/MockVersionControlService');

describe(
		"AdminController Test",
		function() {

			var adminController;
			var mockScope;
			var mockKoheseUser;
			var mockUserList;
			var mockTabService = new MockTabService();
			var mockUserService = new MockUserService();
			var mockState = new MockState();
			var mockItemRepository = new MockItemRepository();
			var mockVersionControlService = new MockVersionControlService();
			
			function KoheseUser() {
				this.name = '';
				this.description = '';
				this.password = '';
			};
			
			KoheseUser.find = function() {
				console.log('KoheseUser.find()');
				var users = [];
				users.$promise = {
					then : function(func) {
						func(mockUserList);
					}
				}
				return users;
			};
			
			KoheseUser.delete = function(user) {
				console.log('KoheseUser.delete()');
				KoheseUser.lastUser = user;
				var users = [];
				users.$promise = {
					then : function(func) {
						func(mockUserList);
					}
				}
				return users;
			};
			
			KoheseUser.upsert = function(user) {
				console.log('KoheseUser.upsert()');
				KoheseUser.lastUser = user;
				console.log('Last user set to: ' + user);
				var users = [];
				users.$promise = {
					then : function(func) {
						func(mockUserList);
					}
				}
				return users;
			}

			beforeEach(angular.mock.module('app.admin'));

			beforeEach(inject(function($q) {

				mockUserList = [ 'user1', 'user2', 'user3' ];

				mockScope = {
					$on : function(name, func) {

					}
				};

			}));

			beforeEach(inject(function($controller) {
				adminController = $controller('AdminController', {
					tabService : mockTabService,
					$state : mockState,
					$scope : mockScope,
					KoheseUser : KoheseUser,
					UserService : mockUserService,
					ItemRepository : mockItemRepository,
					VersionControlService : mockVersionControlService
				});
			}));

			beforeEach( ()=> {
				adminController.selectedUserProxy = {
					item : {}
				}
			})
			
			describe ("User Actions", ()=>{

				// Test Edit User
				it("Edit User", function() {
					var userProxy = {
							item : {
								name : 'UserName',
								description : 'User Description',
								password : 'User Password'
								}
							};
					adminController.editUser(userProxy);
					expect(adminController.usernameInput).toBe('UserName');
					expect(adminController.descriptionInput).toBe('User Description');
					expect(adminController.editUserForm).toBe(true);
					expect(adminController.passwordInput).toBe(undefined);
					expect(adminController.confirmPasswordInput).toBe(undefined);
					expect(adminController.selectedUserProxy).toBe(userProxy);
				});
				
				// Test Clear form
				it("Clears User Form", function() {
					adminController.addUserForm = true;
					adminController.selectedUserProxy.item.name = "Mock User"
					adminController.cancelForm();
					expect(adminController.selectedUserProxy).toBe(null);
					expect(adminController.addUserForm).toBe(false);
					expect(adminController.editUserForm).toBe(false);
				});
				
				// Test Add User
				it("Adda a User", function() {
					expect(adminController.addUserForm).toBe(false);
					console.log('Calling AdminController.addUser');
					adminController.addUser();
					expect(adminController.usernameInput).toBe('');
					expect(adminController.descriptionInput).toBe('');
					expect(adminController.passwordInput).toBe('');
					expect(adminController.confirmPasswordInput).toBe('');
					expect(adminController.currentForm).toBe("Add User");
					expect(adminController.addUserForm).toBe(true);
					expect(adminController.editUserForm).toBe(false);
				});
				
				// Test Upsert User
				it("Upserts a User", function() {
					adminController.usernameInput = 'New User';
					adminController.descriptionInput = 'New User Description';
					adminController.passwordInput = 'password';
					adminController.confirmPasswordInput = 'password';
					console.log('Calling AdminController.upsertUser()');
					adminController.upsertUser();
					// Will want to add some testing of user return from server at 
					// some point here
					expect(adminController.addUserForm).toBe(false);
					expect(adminController.editUserForm).toBe(false);
					expect(adminController.usernameInput).toBe('');
					expect(adminController.passwordInput).toBe('');
					expect(adminController.confirmPasswordInput).toBe('');
					expect(adminController.selectedUserProxy).toBe(null);
				});
				
				// Test Upsert User
				it("Rejects a Bad Password", function() {
					KoheseUser.lastUser = null;
					adminController.usernameInput = 'New User';
					adminController.descriptionInput = 'New User Description';
					adminController.passwordInput = 'password';
					adminController.confirmPasswordInput = 'not the password';
					console.log('Calling AdminController.upsertUser()');
					spyOn(window, 'alert');
					adminController.upsertUser();
					expect(window.alert).toHaveBeenCalledWith('Passwords do not match');
					expect(KoheseUser.lastUser).toBe(null);
				});

				// Test Delete User
				it("Deletes User", function() {
					user = adminController.users[0]
					adminController.deleteUser(user);
					// This test is currently unverifiable due to the way our code
				    // works. But this will catch any erros on the send side.
				});
				
			});
		describe("Version Control Actions", ()=> {

		})

		})
	

