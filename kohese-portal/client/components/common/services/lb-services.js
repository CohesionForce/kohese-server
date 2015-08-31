export default () => {
    (function (window, ng, undefined) {
        'use strict';

        var urlBase = "/api";
        var authHeader = 'authorization';

        /**
         * @ngdoc overview
         * @name lbServices
         * @module
         * @description
         *
         * The `lbServices` module provides services for interacting with
         * the models exposed by the LoopBack server via the REST API.
         *
         */
        var module = angular.module("lbServices", ['ngResource']);

        /**
         * @ngdoc object
         * @name lbServices.User
         * @header lbServices.User
         * @object
         *
         * @description
         *
         * A $resource object for interacting with the `User` model.
         *
         * ## Example
         *
         * See
         * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
         * for an example of using this object.
         *
         */
        module.factory(
            "User",
            ['LoopBackResource', 'LoopBackAuth', '$injector', function (Resource, LoopBackAuth, $injector) {
                var R = Resource(
                    urlBase + "/Users/:id",
                    {'id': '@id'},
                    {

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__findById__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Find a related item by id for accessTokens.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         *  - `fk` – `{*}` - Foreign key for accessTokens
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "prototype$__findById__accessTokens": {
                            url: urlBase + "/Users/:id/accessTokens/:fk",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__destroyById__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Delete a related item by id for accessTokens.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         *  - `fk` – `{*}` - Foreign key for accessTokens
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "prototype$__destroyById__accessTokens": {
                            url: urlBase + "/Users/:id/accessTokens/:fk",
                            method: "DELETE"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__updateById__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Update a related item by id for accessTokens.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         *  - `fk` – `{*}` - Foreign key for accessTokens
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "prototype$__updateById__accessTokens": {
                            url: urlBase + "/Users/:id/accessTokens/:fk",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__get__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Queries accessTokens of User.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         *  - `filter` – `{object=}` -
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "prototype$__get__accessTokens": {
                            isArray: true,
                            url: urlBase + "/Users/:id/accessTokens",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__create__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Creates a new instance in accessTokens of this model.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "prototype$__create__accessTokens": {
                            url: urlBase + "/Users/:id/accessTokens",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__delete__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Deletes all accessTokens of this model.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "prototype$__delete__accessTokens": {
                            url: urlBase + "/Users/:id/accessTokens",
                            method: "DELETE"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$__count__accessTokens
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Counts accessTokens of User.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `count` – `{number=}` -
                         */
                        "prototype$__count__accessTokens": {
                            url: urlBase + "/Users/:id/accessTokens/count",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#create
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Create a new instance of the model and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "create": {
                            url: urlBase + "/Users",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#upsert
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Update an existing model instance or insert a new one into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "upsert": {
                            url: urlBase + "/Users",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#exists
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Check whether a model instance exists in the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `exists` – `{boolean=}` -
                         */
                        "exists": {
                            url: urlBase + "/Users/:id/exists",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#findById
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Find a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         *  - `filter` – `{object=}` - Filter defining fields and include
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "findById": {
                            url: urlBase + "/Users/:id",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#find
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Find all instances of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "find": {
                            isArray: true,
                            url: urlBase + "/Users",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#findOne
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Find first instance of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "findOne": {
                            url: urlBase + "/Users/findOne",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#updateAll
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Update instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "updateAll": {
                            url: urlBase + "/Users/update",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#deleteById
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Delete a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "deleteById": {
                            url: urlBase + "/Users/:id",
                            method: "DELETE"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#count
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Count instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `count` – `{number=}` -
                         */
                        "count": {
                            url: urlBase + "/Users/count",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#prototype$updateAttributes
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Update attributes for a model instance and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - User id
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `User` object.)
                         * </em>
                         */
                        "prototype$updateAttributes": {
                            url: urlBase + "/Users/:id",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#login
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Login a user with username/email and password.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `include` – `{string=}` - Related objects to include in the response. See the description of return value for more details.
                         *   Default value: `user`.
                         *
                         *  - `rememberMe` - `boolean` - Whether the authentication credentials
                         *     should be remembered in localStorage across app/browser restarts.
                         *     Default: `true`.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * The response body contains properties of the AccessToken created on login.
                         * Depending on the value of `include` parameter, the body may contain additional properties:
                         *
                         *   - `user` - `{User}` - Data of the currently logged in user. (`include=user`)
                         *
                         *
                         */
                        "login": {
                            params: {
                                include: "user"
                            },
                            interceptor: {
                                response: function (response) {
                                    var accessToken = response.data;
                                    LoopBackAuth.setUser(accessToken.id, accessToken.userId, accessToken.user);
                                    LoopBackAuth.rememberMe = response.config.params.rememberMe !== false;
                                    LoopBackAuth.save();
                                    return response.resource;
                                }
                            },
                            url: urlBase + "/Users/login",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#logout
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Logout a user with access token
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         *  - `access_token` – `{string}` - Do not supply this argument, it is automatically extracted from request headers.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "logout": {
                            interceptor: {
                                response: function (response) {
                                    LoopBackAuth.clearUser();
                                    LoopBackAuth.clearStorage();
                                    return response.resource;
                                }
                            },
                            url: urlBase + "/Users/logout",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#confirm
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Confirm a user registration with email verification token
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `uid` – `{string}` -
                         *
                         *  - `token` – `{string}` -
                         *
                         *  - `redirect` – `{string=}` -
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "confirm": {
                            url: urlBase + "/Users/confirm",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#resetPassword
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Reset password for a user with email
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "resetPassword": {
                            url: urlBase + "/Users/reset",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.User#getCurrent
                         * @methodOf lbServices.User
                         *
                         * @description
                         *
                         * Get data of the currently logged user. Fail with HTTP result 401
                         * when there is no user logged in.
                         *
                         * @param {function(Object,Object)=} successCb
                         *    Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *    `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         */
                        "getCurrent": {
                            url: urlBase + "/Users" + "/:id",
                            method: "GET",
                            params: {
                                id: function () {
                                    var id = LoopBackAuth.currentUserId;
                                    if (id == null) id = '__anonymous__';
                                    return id;
                                },
                            },
                            interceptor: {
                                response: function (response) {
                                    LoopBackAuth.currentUserData = response.data;
                                    return response.resource;
                                }
                            },
                            __isGetCurrentUser__: true
                        }
                    }
                );


                /**
                 * @ngdoc method
                 * @name lbServices.User#updateOrCreate
                 * @methodOf lbServices.User
                 *
                 * @description
                 *
                 * Update an existing model instance or insert a new one into the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *   This method does not accept any parameters.
                 *   Supply an empty object or omit this argument altogether.
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `User` object.)
                 * </em>
                 */
                R["updateOrCreate"] = R["upsert"];

                /**
                 * @ngdoc method
                 * @name lbServices.User#update
                 * @methodOf lbServices.User
                 *
                 * @description
                 *
                 * Update instances of the model matched by where from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `where` – `{object=}` - Criteria to match model instances
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["update"] = R["updateAll"];

                /**
                 * @ngdoc method
                 * @name lbServices.User#destroyById
                 * @methodOf lbServices.User
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["destroyById"] = R["deleteById"];

                /**
                 * @ngdoc method
                 * @name lbServices.User#removeById
                 * @methodOf lbServices.User
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["removeById"] = R["deleteById"];

                /**
                 * @ngdoc method
                 * @name lbServices.User#getCachedCurrent
                 * @methodOf lbServices.User
                 *
                 * @description
                 *
                 * Get data of the currently logged user that was returned by the last
                 * call to {@link lbServices.User#login} or
                 * {@link lbServices.User#getCurrent}. Return null when there
                 * is no user logged in or the data of the current user were not fetched
                 * yet.
                 *
                 * @returns {Object} A User instance.
                 */
                R.getCachedCurrent = function () {
                    var data = LoopBackAuth.currentUserData;
                    return data ? new R(data) : null;
                };

                /**
                 * @ngdoc method
                 * @name lbServices.User#isAuthenticated
                 * @methodOf lbServices.User
                 *
                 * @returns {boolean} True if the current user is authenticated (logged in).
                 */
                R.isAuthenticated = function () {
                    return this.getCurrentId() != null;
                };

                /**
                 * @ngdoc method
                 * @name lbServices.User#getCurrentId
                 * @methodOf lbServices.User
                 *
                 * @returns {Object} Id of the currently logged-in user or null.
                 */
                R.getCurrentId = function () {
                    return LoopBackAuth.currentUserId;
                };

                /**
                 * @ngdoc property
                 * @name lbServices.User#modelName
                 * @propertyOf lbServices.User
                 * @description
                 * The name of the model represented by this $resource,
                 * i.e. `User`.
                 */
                R.modelName = "User";


                return R;
            }]);

        /**
         * @ngdoc object
         * @name lbServices.Item
         * @header lbServices.Item
         * @object
         *
         * @description
         *
         * A $resource object for interacting with the `Item` model.
         *
         * ## Example
         *
         * See
         * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
         * for an example of using this object.
         *
         */
        module.factory(
            "Item",
            ['LoopBackResource', 'LoopBackAuth', '$injector', function (Resource, LoopBackAuth, $injector) {
                var R = Resource(
                    urlBase + "/Items/:id",
                    {'id': '@id'},
                    {

                        // INTERNAL. Use Item.children.findById() instead.
                        "prototype$__findById__children": {
                            url: urlBase + "/Items/:id/children/:fk",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children.destroyById() instead.
                        "prototype$__destroyById__children": {
                            url: urlBase + "/Items/:id/children/:fk",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children.updateById() instead.
                        "prototype$__updateById__children": {
                            url: urlBase + "/Items/:id/children/:fk",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.children2.findById() instead.
                        "prototype$__findById__children2": {
                            url: urlBase + "/Items/:id/children2/:fk",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children2.destroyById() instead.
                        "prototype$__destroyById__children2": {
                            url: urlBase + "/Items/:id/children2/:fk",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children2.updateById() instead.
                        "prototype$__updateById__children2": {
                            url: urlBase + "/Items/:id/children2/:fk",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.children2.link() instead.
                        "prototype$__link__children2": {
                            url: urlBase + "/Items/:id/children2/rel/:fk",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.children2.unlink() instead.
                        "prototype$__unlink__children2": {
                            url: urlBase + "/Items/:id/children2/rel/:fk",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children2.exists() instead.
                        "prototype$__exists__children2": {
                            url: urlBase + "/Items/:id/children2/rel/:fk",
                            method: "HEAD"
                        },

                        // INTERNAL. Use Item.parent() instead.
                        "prototype$__get__parent": {
                            url: urlBase + "/Items/:id/parent",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.analysis() instead.
                        "prototype$__get__analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.analysis.create() instead.
                        "prototype$__create__analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.analysis.update() instead.
                        "prototype$__update__analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.analysis.destroy() instead.
                        "prototype$__destroy__analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children() instead.
                        "prototype$__get__children": {
                            isArray: true,
                            url: urlBase + "/Items/:id/children",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children.create() instead.
                        "prototype$__create__children": {
                            url: urlBase + "/Items/:id/children",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.children.destroyAll() instead.
                        "prototype$__delete__children": {
                            url: urlBase + "/Items/:id/children",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children.count() instead.
                        "prototype$__count__children": {
                            url: urlBase + "/Items/:id/children/count",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children2() instead.
                        "prototype$__get__children2": {
                            isArray: true,
                            url: urlBase + "/Items/:id/children2",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children2.create() instead.
                        "prototype$__create__children2": {
                            url: urlBase + "/Items/:id/children2",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.children2.destroyAll() instead.
                        "prototype$__delete__children2": {
                            url: urlBase + "/Items/:id/children2",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children2.count() instead.
                        "prototype$__count__children2": {
                            url: urlBase + "/Items/:id/children2/count",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#create
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Create a new instance of the model and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "create": {
                            url: urlBase + "/Items",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#upsert
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Update an existing model instance or insert a new one into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "upsert": {
                            url: urlBase + "/Items",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#exists
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Check whether a model instance exists in the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `exists` – `{boolean=}` -
                         */
                        "exists": {
                            url: urlBase + "/Items/:id/exists",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#findById
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Find a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         *  - `filter` – `{object=}` - Filter defining fields and include
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "findById": {
                            url: urlBase + "/Items/:id",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#find
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Find all instances of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "find": {
                            isArray: true,
                            url: urlBase + "/Items",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#findOne
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Find first instance of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "findOne": {
                            url: urlBase + "/Items/findOne",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#updateAll
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Update instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "updateAll": {
                            url: urlBase + "/Items/update",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#deleteById
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Delete a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "deleteById": {
                            url: urlBase + "/Items/:id",
                            method: "DELETE"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#count
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Count instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `count` – `{number=}` -
                         */
                        "count": {
                            url: urlBase + "/Items/count",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#prototype$updateAttributes
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Update attributes for a model instance and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - PersistedModel id
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "prototype$updateAttributes": {
                            url: urlBase + "/Items/:id",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#diff
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Get a set of deltas and conflicts since the given checkpoint.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         *  - `since` – `{number=}` - Find deltas since this checkpoint
                         *
                         *  - `remoteChanges` – `{array=}` - an array of change objects
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "diff": {
                            url: urlBase + "/Items/diff",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#changes
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Get the changes to a model since a given checkpoint.Provide a filter object to reduce the number of results returned.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `since` – `{number=}` - Only return changes since this checkpoint
                         *
                         *  - `filter` – `{object=}` - Only include changes that match this filter
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "changes": {
                            isArray: true,
                            url: urlBase + "/Items/changes",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#checkpoint
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Create a checkpoint.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method does not accept any data. Supply an empty object.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "checkpoint": {
                            url: urlBase + "/Items/checkpoint",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#currentCheckpoint
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Get the current checkpoint.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "currentCheckpoint": {
                            url: urlBase + "/Items/checkpoint",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#createUpdates
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Create an update list from a delta list.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "createUpdates": {
                            isArray: true,
                            url: urlBase + "/Items/create-updates",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#bulkUpdate
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Run multiple updates at once. Note: this is not atomic.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         *  - `updates` – `{array=}` -
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "bulkUpdate": {
                            url: urlBase + "/Items/bulk-update",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#findLastChange
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Get the most recent change record for this instance.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "findLastChange": {
                            url: urlBase + "/Items/:id/changes/last",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#updateLastChange
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Update the properties of the most recent change record,kept for this instance.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item` object.)
                         * </em>
                         */
                        "updateLastChange": {
                            url: urlBase + "/Items/:id/changes/last",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#rectifyAllChanges
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Rectify all Model changes.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method does not accept any data. Supply an empty object.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "rectifyAllChanges": {
                            url: urlBase + "/Items/rectify-all",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#rectifyChange
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * Tell loopback that a change to the model with the given id has occurred.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*=}` -
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method does not accept any data. Supply an empty object.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "rectifyChange": {
                            url: urlBase + "/Items/:id/rectify-change",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item#performAnalysis
                         * @methodOf lbServices.Item
                         *
                         * @description
                         *
                         * <em>
                         * (The remote method definition does not provide any description.)
                         * </em>
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         *  - `onId` – `{string=}` -
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `data` – `{object=}` -
                         */
                        "performAnalysis": {
                            url: urlBase + "/Items/performAnalysis",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.children.findById() instead.
                        "::findById::Item::children": {
                            url: urlBase + "/Items/:id/children/:fk",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children.destroyById() instead.
                        "::destroyById::Item::children": {
                            url: urlBase + "/Items/:id/children/:fk",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children.updateById() instead.
                        "::updateById::Item::children": {
                            url: urlBase + "/Items/:id/children/:fk",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.children2.findById() instead.
                        "::findById::Item::children2": {
                            url: urlBase + "/Items/:id/children2/:fk",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children2.destroyById() instead.
                        "::destroyById::Item::children2": {
                            url: urlBase + "/Items/:id/children2/:fk",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children2.updateById() instead.
                        "::updateById::Item::children2": {
                            url: urlBase + "/Items/:id/children2/:fk",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.children2.link() instead.
                        "::link::Item::children2": {
                            url: urlBase + "/Items/:id/children2/rel/:fk",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.children2.unlink() instead.
                        "::unlink::Item::children2": {
                            url: urlBase + "/Items/:id/children2/rel/:fk",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children2.exists() instead.
                        "::exists::Item::children2": {
                            url: urlBase + "/Items/:id/children2/rel/:fk",
                            method: "HEAD"
                        },

                        // INTERNAL. Use Item.parent() instead.
                        "::get::Item::parent": {
                            url: urlBase + "/Items/:id/parent",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children() instead.
                        "::get::Item::children": {
                            isArray: true,
                            url: urlBase + "/Items/:id/children",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children.create() instead.
                        "::create::Item::children": {
                            url: urlBase + "/Items/:id/children",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.children.destroyAll() instead.
                        "::delete::Item::children": {
                            url: urlBase + "/Items/:id/children",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children.count() instead.
                        "::count::Item::children": {
                            url: urlBase + "/Items/:id/children/count",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children2() instead.
                        "::get::Item::children2": {
                            isArray: true,
                            url: urlBase + "/Items/:id/children2",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.children2.create() instead.
                        "::create::Item::children2": {
                            url: urlBase + "/Items/:id/children2",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.children2.destroyAll() instead.
                        "::delete::Item::children2": {
                            url: urlBase + "/Items/:id/children2",
                            method: "DELETE"
                        },

                        // INTERNAL. Use Item.children2.count() instead.
                        "::count::Item::children2": {
                            url: urlBase + "/Items/:id/children2/count",
                            method: "GET"
                        },
                    }
                );


                /**
                 * @ngdoc method
                 * @name lbServices.Item#updateOrCreate
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Update an existing model instance or insert a new one into the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *   This method does not accept any parameters.
                 *   Supply an empty object or omit this argument altogether.
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R["updateOrCreate"] = R["upsert"];

                /**
                 * @ngdoc method
                 * @name lbServices.Item#update
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Update instances of the model matched by where from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `where` – `{object=}` - Criteria to match model instances
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["update"] = R["updateAll"];

                /**
                 * @ngdoc method
                 * @name lbServices.Item#destroyById
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["destroyById"] = R["deleteById"];

                /**
                 * @ngdoc method
                 * @name lbServices.Item#removeById
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["removeById"] = R["deleteById"];


                /**
                 * @ngdoc property
                 * @name lbServices.Item#modelName
                 * @propertyOf lbServices.Item
                 * @description
                 * The name of the model represented by this $resource,
                 * i.e. `Item`.
                 */
                R.modelName = "Item";

                /**
                 * @ngdoc object
                 * @name lbServices.Item.children
                 * @header lbServices.Item.children
                 * @object
                 * @description
                 *
                 * The object `Item.children` groups methods
                 * manipulating `Item` instances related to `Item`.
                 *
                 * Call {@link lbServices.Item#children Item.children()}
                 * to query all related instances.
                 */


                /**
                 * @ngdoc method
                 * @name lbServices.Item#children
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Queries children of Item.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `filter` – `{object=}` -
                 *
                 * @param {function(Array.<Object>,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Array.<Object>} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::get::Item::children"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children#count
                 * @methodOf lbServices.Item.children
                 *
                 * @description
                 *
                 * Counts children of Item.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `where` – `{object=}` - Criteria to match model instances
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * Data properties:
                 *
                 *  - `count` – `{number=}` -
                 */
                R.children.count = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::count::Item::children"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children#create
                 * @methodOf lbServices.Item.children
                 *
                 * @description
                 *
                 * Creates a new instance in children of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children.create = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::create::Item::children"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children#destroyAll
                 * @methodOf lbServices.Item.children
                 *
                 * @description
                 *
                 * Deletes all children of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R.children.destroyAll = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::delete::Item::children"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children#destroyById
                 * @methodOf lbServices.Item.children
                 *
                 * @description
                 *
                 * Delete a related item by id for children.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R.children.destroyById = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::destroyById::Item::children"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children#findById
                 * @methodOf lbServices.Item.children
                 *
                 * @description
                 *
                 * Find a related item by id for children.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children.findById = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::findById::Item::children"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children#updateById
                 * @methodOf lbServices.Item.children
                 *
                 * @description
                 *
                 * Update a related item by id for children.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children.updateById = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::updateById::Item::children"];
                    return action.apply(R, arguments);
                };
                /**
                 * @ngdoc object
                 * @name lbServices.Item.children2
                 * @header lbServices.Item.children2
                 * @object
                 * @description
                 *
                 * The object `Item.children2` groups methods
                 * manipulating `Item` instances related to `Item`.
                 *
                 * Call {@link lbServices.Item#children2 Item.children2()}
                 * to query all related instances.
                 */


                /**
                 * @ngdoc method
                 * @name lbServices.Item#children2
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Queries children2 of Item.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `filter` – `{object=}` -
                 *
                 * @param {function(Array.<Object>,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Array.<Object>} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children2 = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::get::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#count
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Counts children2 of Item.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `where` – `{object=}` - Criteria to match model instances
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * Data properties:
                 *
                 *  - `count` – `{number=}` -
                 */
                R.children2.count = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::count::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#create
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Creates a new instance in children2 of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children2.create = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::create::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#destroyAll
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Deletes all children2 of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R.children2.destroyAll = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::delete::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#destroyById
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Delete a related item by id for children2.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children2
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R.children2.destroyById = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::destroyById::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#exists
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Check the existence of children2 relation to an item by id.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children2
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children2.exists = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::exists::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#findById
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Find a related item by id for children2.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children2
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children2.findById = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::findById::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#link
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Add a related item by id for children2.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children2
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method does not accept any data. Supply an empty object.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children2.link = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::link::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#unlink
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Remove the children2 relation to an item by id.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children2
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R.children2.unlink = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::unlink::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.children2#updateById
                 * @methodOf lbServices.Item.children2
                 *
                 * @description
                 *
                 * Update a related item by id for children2.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `fk` – `{*}` - Foreign key for children2
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.children2.updateById = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::updateById::Item::children2"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item#parent
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Fetches belongsTo relation parent.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `refresh` – `{boolean=}` -
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item` object.)
                 * </em>
                 */
                R.parent = function () {
                    var TargetResource = $injector.get("Item");
                    var action = TargetResource["::get::Item::parent"];
                    return action.apply(R, arguments);
                };
                /**
                 * @ngdoc object
                 * @name lbServices.Item.analysis
                 * @header lbServices.Item.analysis
                 * @object
                 * @description
                 *
                 * The object `Item.analysis` groups methods
                 * manipulating `Analysis` instances related to `Item`.
                 *
                 * Call {@link lbServices.Item#analysis Item.analysis()}
                 * to query all related instances.
                 */


                /**
                 * @ngdoc method
                 * @name lbServices.Item#analysis
                 * @methodOf lbServices.Item
                 *
                 * @description
                 *
                 * Fetches hasOne relation analysis.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 *  - `refresh` – `{boolean=}` -
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Analysis` object.)
                 * </em>
                 */
                R.analysis = function () {
                    var TargetResource = $injector.get("Analysis");
                    var action = TargetResource["::get::Item::analysis"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.analysis#create
                 * @methodOf lbServices.Item.analysis
                 *
                 * @description
                 *
                 * Creates a new instance in analysis of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Analysis` object.)
                 * </em>
                 */
                R.analysis.create = function () {
                    var TargetResource = $injector.get("Analysis");
                    var action = TargetResource["::create::Item::analysis"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.analysis#destroy
                 * @methodOf lbServices.Item.analysis
                 *
                 * @description
                 *
                 * Deletes analysis of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R.analysis.destroy = function () {
                    var TargetResource = $injector.get("Analysis");
                    var action = TargetResource["::destroy::Item::analysis"];
                    return action.apply(R, arguments);
                };

                /**
                 * @ngdoc method
                 * @name lbServices.Item.analysis#update
                 * @methodOf lbServices.Item.analysis
                 *
                 * @description
                 *
                 * Update analysis of this model.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - PersistedModel id
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Analysis` object.)
                 * </em>
                 */
                R.analysis.update = function () {
                    var TargetResource = $injector.get("Analysis");
                    var action = TargetResource["::update::Item::analysis"];
                    return action.apply(R, arguments);
                };

                return R;
            }]);

        /**
         * @ngdoc object
         * @name lbServices.Item-change
         * @header lbServices.Item-change
         * @object
         *
         * @description
         *
         * A $resource object for interacting with the `Item-change` model.
         *
         * ## Example
         *
         * See
         * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
         * for an example of using this object.
         *
         */
        module.factory(
            "Item-change",
            ['LoopBackResource', 'LoopBackAuth', '$injector', function (Resource, LoopBackAuth, $injector) {
                var R = Resource(
                    urlBase + "/Item-changes/:id",
                    {'id': '@id'},
                    {

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#create
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Create a new instance of the model and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item-change` object.)
                         * </em>
                         */
                        "create": {
                            url: urlBase + "/Item-changes",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#upsert
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Update an existing model instance or insert a new one into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item-change` object.)
                         * </em>
                         */
                        "upsert": {
                            url: urlBase + "/Item-changes",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#exists
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Check whether a model instance exists in the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `exists` – `{boolean=}` -
                         */
                        "exists": {
                            url: urlBase + "/Item-changes/:id/exists",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#findById
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Find a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         *  - `filter` – `{object=}` - Filter defining fields and include
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item-change` object.)
                         * </em>
                         */
                        "findById": {
                            url: urlBase + "/Item-changes/:id",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#find
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Find all instances of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item-change` object.)
                         * </em>
                         */
                        "find": {
                            isArray: true,
                            url: urlBase + "/Item-changes",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#findOne
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Find first instance of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item-change` object.)
                         * </em>
                         */
                        "findOne": {
                            url: urlBase + "/Item-changes/findOne",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#updateAll
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Update instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "updateAll": {
                            url: urlBase + "/Item-changes/update",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#deleteById
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Delete a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "deleteById": {
                            url: urlBase + "/Item-changes/:id",
                            method: "DELETE"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#count
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Count instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `count` – `{number=}` -
                         */
                        "count": {
                            url: urlBase + "/Item-changes/count",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Item-change#prototype$updateAttributes
                         * @methodOf lbServices.Item-change
                         *
                         * @description
                         *
                         * Update attributes for a model instance and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Change id
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Item-change` object.)
                         * </em>
                         */
                        "prototype$updateAttributes": {
                            url: urlBase + "/Item-changes/:id",
                            method: "PUT"
                        },
                    }
                );


                /**
                 * @ngdoc method
                 * @name lbServices.Item-change#updateOrCreate
                 * @methodOf lbServices.Item-change
                 *
                 * @description
                 *
                 * Update an existing model instance or insert a new one into the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *   This method does not accept any parameters.
                 *   Supply an empty object or omit this argument altogether.
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Item-change` object.)
                 * </em>
                 */
                R["updateOrCreate"] = R["upsert"];

                /**
                 * @ngdoc method
                 * @name lbServices.Item-change#update
                 * @methodOf lbServices.Item-change
                 *
                 * @description
                 *
                 * Update instances of the model matched by where from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `where` – `{object=}` - Criteria to match model instances
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["update"] = R["updateAll"];

                /**
                 * @ngdoc method
                 * @name lbServices.Item-change#destroyById
                 * @methodOf lbServices.Item-change
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["destroyById"] = R["deleteById"];

                /**
                 * @ngdoc method
                 * @name lbServices.Item-change#removeById
                 * @methodOf lbServices.Item-change
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["removeById"] = R["deleteById"];


                /**
                 * @ngdoc property
                 * @name lbServices.Item-change#modelName
                 * @propertyOf lbServices.Item-change
                 * @description
                 * The name of the model represented by this $resource,
                 * i.e. `Item-change`.
                 */
                R.modelName = "Item-change";


                return R;
            }]);

        /**
         * @ngdoc object
         * @name lbServices.Analysis
         * @header lbServices.Analysis
         * @object
         *
         * @description
         *
         * A $resource object for interacting with the `Analysis` model.
         *
         * ## Example
         *
         * See
         * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
         * for an example of using this object.
         *
         */
        module.factory(
            "Analysis",
            ['LoopBackResource', 'LoopBackAuth', '$injector', function (Resource, LoopBackAuth, $injector) {
                var R = Resource(
                    urlBase + "/Analyses/:id",
                    {'id': '@id'},
                    {

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#create
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Create a new instance of the model and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Analysis` object.)
                         * </em>
                         */
                        "create": {
                            url: urlBase + "/Analyses",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#upsert
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Update an existing model instance or insert a new one into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *   This method does not accept any parameters.
                         *   Supply an empty object or omit this argument altogether.
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Analysis` object.)
                         * </em>
                         */
                        "upsert": {
                            url: urlBase + "/Analyses",
                            method: "PUT"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#exists
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Check whether a model instance exists in the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `exists` – `{boolean=}` -
                         */
                        "exists": {
                            url: urlBase + "/Analyses/:id/exists",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#findById
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Find a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         *  - `filter` – `{object=}` - Filter defining fields and include
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Analysis` object.)
                         * </em>
                         */
                        "findById": {
                            url: urlBase + "/Analyses/:id",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#find
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Find all instances of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Array.<Object>,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Array.<Object>} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Analysis` object.)
                         * </em>
                         */
                        "find": {
                            isArray: true,
                            url: urlBase + "/Analyses",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#findOne
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Find first instance of the model matched by filter from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Analysis` object.)
                         * </em>
                         */
                        "findOne": {
                            url: urlBase + "/Analyses/findOne",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#updateAll
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Update instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "updateAll": {
                            url: urlBase + "/Analyses/update",
                            method: "POST"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#deleteById
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Delete a model instance by id from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - Model id
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * This method returns no data.
                         */
                        "deleteById": {
                            url: urlBase + "/Analyses/:id",
                            method: "DELETE"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#count
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Count instances of the model matched by where from the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `where` – `{object=}` - Criteria to match model instances
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * Data properties:
                         *
                         *  - `count` – `{number=}` -
                         */
                        "count": {
                            url: urlBase + "/Analyses/count",
                            method: "GET"
                        },

                        /**
                         * @ngdoc method
                         * @name lbServices.Analysis#prototype$updateAttributes
                         * @methodOf lbServices.Analysis
                         *
                         * @description
                         *
                         * Update attributes for a model instance and persist it into the data source.
                         *
                         * @param {Object=} parameters Request parameters.
                         *
                         *  - `id` – `{*}` - PersistedModel id
                         *
                         * @param {Object} postData Request data.
                         *
                         * This method expects a subset of model properties as request parameters.
                         *
                         * @param {function(Object,Object)=} successCb
                         *   Success callback with two arguments: `value`, `responseHeaders`.
                         *
                         * @param {function(Object)=} errorCb Error callback with one argument:
                         *   `httpResponse`.
                         *
                         * @returns {Object} An empty reference that will be
                         *   populated with the actual data once the response is returned
                         *   from the server.
                         *
                         * <em>
                         * (The remote method definition does not provide any description.
                         * This usually means the response is a `Analysis` object.)
                         * </em>
                         */
                        "prototype$updateAttributes": {
                            url: urlBase + "/Analyses/:id",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.analysis() instead.
                        "::get::Item::analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "GET"
                        },

                        // INTERNAL. Use Item.analysis.create() instead.
                        "::create::Item::analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "POST"
                        },

                        // INTERNAL. Use Item.analysis.update() instead.
                        "::update::Item::analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "PUT"
                        },

                        // INTERNAL. Use Item.analysis.destroy() instead.
                        "::destroy::Item::analysis": {
                            url: urlBase + "/Items/:id/analysis",
                            method: "DELETE"
                        },
                    }
                );


                /**
                 * @ngdoc method
                 * @name lbServices.Analysis#updateOrCreate
                 * @methodOf lbServices.Analysis
                 *
                 * @description
                 *
                 * Update an existing model instance or insert a new one into the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *   This method does not accept any parameters.
                 *   Supply an empty object or omit this argument altogether.
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `Analysis` object.)
                 * </em>
                 */
                R["updateOrCreate"] = R["upsert"];

                /**
                 * @ngdoc method
                 * @name lbServices.Analysis#update
                 * @methodOf lbServices.Analysis
                 *
                 * @description
                 *
                 * Update instances of the model matched by where from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `where` – `{object=}` - Criteria to match model instances
                 *
                 * @param {Object} postData Request data.
                 *
                 * This method expects a subset of model properties as request parameters.
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["update"] = R["updateAll"];

                /**
                 * @ngdoc method
                 * @name lbServices.Analysis#destroyById
                 * @methodOf lbServices.Analysis
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["destroyById"] = R["deleteById"];

                /**
                 * @ngdoc method
                 * @name lbServices.Analysis#removeById
                 * @methodOf lbServices.Analysis
                 *
                 * @description
                 *
                 * Delete a model instance by id from the data source.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{*}` - Model id
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * This method returns no data.
                 */
                R["removeById"] = R["deleteById"];


                /**
                 * @ngdoc property
                 * @name lbServices.Analysis#modelName
                 * @propertyOf lbServices.Analysis
                 * @description
                 * The name of the model represented by this $resource,
                 * i.e. `Analysis`.
                 */
                R.modelName = "Analysis";


                return R;
            }]);


        module
            .factory('LoopBackAuth', function () {
                var props = ['accessTokenId', 'currentUserId'];
                var propsPrefix = '$LoopBack$';

                function LoopBackAuth() {
                    var self = this;
                    props.forEach(function (name) {
                        self[name] = load(name);
                    });
                    this.rememberMe = undefined;
                    this.currentUserData = null;
                }

                LoopBackAuth.prototype.save = function () {
                    var self = this;
                    var storage = this.rememberMe ? localStorage : sessionStorage;
                    props.forEach(function (name) {
                        save(storage, name, self[name]);
                    });
                };

                LoopBackAuth.prototype.setUser = function (accessTokenId, userId, userData) {
                    this.accessTokenId = accessTokenId;
                    this.currentUserId = userId;
                    this.currentUserData = userData;
                }

                LoopBackAuth.prototype.clearUser = function () {
                    this.accessTokenId = null;
                    this.currentUserId = null;
                    this.currentUserData = null;
                }

                LoopBackAuth.prototype.clearStorage = function () {
                    props.forEach(function (name) {
                        save(sessionStorage, name, null);
                        save(localStorage, name, null);
                    });
                };

                return new LoopBackAuth();

                // Note: LocalStorage converts the value to string
                // We are using empty string as a marker for null/undefined values.
                function save(storage, name, value) {
                    var key = propsPrefix + name;
                    if (value == null) value = '';
                    storage[key] = value;
                }

                function load(name) {
                    var key = propsPrefix + name;
                    return localStorage[key] || sessionStorage[key] || null;
                }
            })
            .config(['$httpProvider', function ($httpProvider) {
                $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
            }])
            .factory('LoopBackAuthRequestInterceptor', ['$q', 'LoopBackAuth',
                function ($q, LoopBackAuth) {
                    return {
                        'request': function (config) {

                            // filter out non urlBase requests
                            if (config.url.substr(0, urlBase.length) !== urlBase) {
                                return config;
                            }

                            if (LoopBackAuth.accessTokenId) {
                                config.headers[authHeader] = LoopBackAuth.accessTokenId;
                            } else if (config.__isGetCurrentUser__) {
                                // Return a stub 401 error for User.getCurrent() when
                                // there is no user logged in
                                var res = {
                                    body: {error: {status: 401}},
                                    status: 401,
                                    config: config,
                                    headers: function () {
                                        return undefined;
                                    }
                                };
                                return $q.reject(res);
                            }
                            return config || $q.when(config);
                        }
                    }
                }])

        /**
         * @ngdoc object
         * @name lbServices.LoopBackResourceProvider
         * @header lbServices.LoopBackResourceProvider
         * @description
         * Use `LoopBackResourceProvider` to change the global configuration
         * settings used by all models. Note that the provider is available
         * to Configuration Blocks only, see
         * {@link https://docs.angularjs.org/guide/module#module-loading-dependencies Module Loading & Dependencies}
         * for more details.
         *
         * ## Example
         *
         * ```js
         * angular.module('app')
         *  .config(function(LoopBackResourceProvider) {
   *     LoopBackResourceProvider.setAuthHeader('X-Access-Token');
   *  });
         * ```
         */
            .provider('LoopBackResource', function LoopBackResourceProvider() {
                /**
                 * @ngdoc method
                 * @name lbServices.LoopBackResourceProvider#setAuthHeader
                 * @methodOf lbServices.LoopBackResourceProvider
                 * @param {string} header The header name to use, e.g. `X-Access-Token`
                 * @description
                 * Configure the REST transport to use a different header for sending
                 * the authentication token. It is sent in the `Authorization` header
                 * by default.
                 */
                this.setAuthHeader = function (header) {
                    authHeader = header;
                };

                /**
                 * @ngdoc method
                 * @name lbServices.LoopBackResourceProvider#setUrlBase
                 * @methodOf lbServices.LoopBackResourceProvider
                 * @param {string} url The URL to use, e.g. `/api` or `//example.com/api`.
                 * @description
                 * Change the URL of the REST API server. By default, the URL provided
                 * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
                 */
                this.setUrlBase = function (url) {
                    urlBase = url;
                };

                this.$get = ['$resource', function ($resource) {
                    return function (url, params, actions) {
                        var resource = $resource(url, params, actions);

                        // Angular always calls POST on $save()
                        // This hack is based on
                        // http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
                        resource.prototype.$save = function (success, error) {
                            // Fortunately, LoopBack provides a convenient `upsert` method
                            // that exactly fits our needs.
                            var result = resource.upsert.call(this, {}, this, success, error);
                            return result.$promise || result;
                        };
                        return resource;
                    };
                }];
            });


    })(window, window.angular);
}
