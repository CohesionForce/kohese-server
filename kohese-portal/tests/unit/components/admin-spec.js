/**
 * New node file
 */
describe(
		"AdminController Test",
		function() {

			var mockTabService;
			var adminController;
			var mockScope;
			var mockKoheseUser;
			var mockUserList;

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

			beforeEach(module('app.admin'));

			beforeEach(inject(function($q) {

				mockUserList = [ 'user1', 'user2', 'user3' ];

				// Set up the Mock Login Service
				mockTabService = {

					tab : {
						title : undefined,
						type : undefined,
						setTitle : function(newTitle) {
							tab.title = newTitle;
						}
					},

					getCurrentTab : function() {
						return mockTabService.tab;
					}
				};

				mockScope = {
					$on : function(name, func) {

					}
				};

			}));

			beforeEach(inject(function($controller) {
				adminController = $controller('AdminController', {
					tabService : mockTabService,
					$scope : mockScope,
					KoheseUser : KoheseUser
				});
			}));

			// Test Edit User
			it("Test Edit User", function() {
				var user = {
						name : 'UserName',
						description : 'User Description',
						password : 'User Password'};
				adminController.editUser(user);
				expect(adminController.usernameInput).toBe('UserName');
				expect(adminController.descriptionInput).toBe('User Description');
				expect(adminController.editUserForm).toBe(true);
				expect(adminController.passwordInput).toBe(undefined);
                expect(adminController.confirmPasswordInput).toBe(undefined);
				expect(adminController.selectedUser).toBe(user);
			});
			
			// Test Clear form
			it("Test Clear Form", function() {
				adminController.cancelForm();
				expect(adminController.selectedUser).toBe(null);
		        expect(adminController.addUserForm).toBe(false);
		        expect(adminController.editUserForm).toBe(false);
			});
			
			// Test Add User
			it("Test Add User", function() {
		        expect(adminController.addUserForm).toBe(false);
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
			it("Test Upsert User", function() {
				adminController.usernameInput = 'New User';
				adminController.descriptionInput = 'New User Description';
				adminController.passwordInput = 'password';
				adminController.confirmPasswordInput = 'password';
				console.log('Calling AdminController.upsertUser()');
				adminController.upsertUser();
				expect(KoheseUser.lastUser.name).toBe('New User');
				expect(KoheseUser.lastUser.description).toBe('New User Description');
				expect(KoheseUser.lastUser.password).toBe('password');
		        expect(adminController.addUserForm).toBe(false);
		        expect(adminController.editUserForm).toBe(false);
		        expect(adminController.usernameInput).toBe('');
				expect(adminController.passwordInput).toBe('');
				expect(adminController.confirmPasswordInput).toBe('');
				expect(adminController.selectedUser).toBe(null);
			});
			
			// Test Upsert User
			it("Test Upsert User Bad Password", function() {
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
			it("Test Delete User", function() {
				user = new KoheseUser();
				adminController.deleteUser(user);
				expect(KoheseUser.lastUser).toBe(user);
			});
			
		});

describe("suite name", function() {
});