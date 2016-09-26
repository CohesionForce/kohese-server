export default () => {
// CommonJS package manager support
if (typeof module !== 'undefined' && typeof exports !== 'undefined' &&
  module.exports === exports) {
  // Export the *name* of this Angular module
  // Sample usage:
  //
  //   import lbServices from './lb-services';
  //   angular.module('app', [lbServices]);
  //
  module.exports = "lbServices";
}

(function(window, angular, undefined) {
  'use strict';

  var urlBase = "/api";
  var authHeader = 'authorization';

  function getHost(url) {
    var m = url.match(/^(?:https?:)?\/\/([^\/]+)/);
    return m ? m[1] : null;
  }

  var urlBaseHost = getHost(urlBase) || location.host;

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
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Items/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Item.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Item.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Item.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Item.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Item.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Item.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Item.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Items/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Item.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Item.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Item.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Item.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Items/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Item.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Items/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Item.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Items/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Items/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Item.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Items/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Item.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Items/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Item.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Items/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Items/:id/children2/count",
              method: "GET",
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
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Item#createMany
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
            "createMany": {
              isArray: true,
              url: urlBase + "/Items",
              method: "POST",
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
              method: "PUT",
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
              method: "GET",
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
              method: "GET",
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
              method: "GET",
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
              method: "GET",
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Items/update",
              method: "POST",
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Item` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Items/:id",
              method: "DELETE",
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
              method: "GET",
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
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Item#createChangeStream
             * @methodOf lbServices.Item
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Items/change-stream",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Item#getHistory
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
             *  - `req` – `{object=}` -
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
            "getHistory": {
              url: urlBase + "/Items/getHistory",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Item#getStatus
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
             *  - `req` – `{object=}` -
             *
             *  - `repoId` – `{string=}` -
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
            "getStatus": {
              url: urlBase + "/Items/getStatus",
              method: "POST",
            },

            // INTERNAL. Use Item.children.findById() instead.
            "::findById::Item::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Item.children.destroyById() instead.
            "::destroyById::Item::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children.updateById() instead.
            "::updateById::Item::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Item.children2.findById() instead.
            "::findById::Item::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Item.children2.destroyById() instead.
            "::destroyById::Item::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children2.updateById() instead.
            "::updateById::Item::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Item.children2.link() instead.
            "::link::Item::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Item.children2.unlink() instead.
            "::unlink::Item::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children2.exists() instead.
            "::exists::Item::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Items/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Item.parent() instead.
            "::get::Item::parent": {
              url: urlBase + "/Items/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Item.children() instead.
            "::get::Item::children": {
              isArray: true,
              url: urlBase + "/Items/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Item.children.create() instead.
            "::create::Item::children": {
              url: urlBase + "/Items/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Item.children.createMany() instead.
            "::createMany::Item::children": {
              isArray: true,
              url: urlBase + "/Items/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Item.children.destroyAll() instead.
            "::delete::Item::children": {
              url: urlBase + "/Items/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children.count() instead.
            "::count::Item::children": {
              url: urlBase + "/Items/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Item.children2() instead.
            "::get::Item::children2": {
              isArray: true,
              url: urlBase + "/Items/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Item.children2.create() instead.
            "::create::Item::children2": {
              url: urlBase + "/Items/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Item.children2.createMany() instead.
            "::createMany::Item::children2": {
              isArray: true,
              url: urlBase + "/Items/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Item.children2.destroyAll() instead.
            "::delete::Item::children2": {
              url: urlBase + "/Items/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Item.children2.count() instead.
            "::count::Item::children2": {
              url: urlBase + "/Items/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children.findById() instead.
            "::findById::KoheseUser::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children.destroyById() instead.
            "::destroyById::KoheseUser::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children.updateById() instead.
            "::updateById::KoheseUser::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.children2.findById() instead.
            "::findById::KoheseUser::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children2.destroyById() instead.
            "::destroyById::KoheseUser::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children2.updateById() instead.
            "::updateById::KoheseUser::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.children2.link() instead.
            "::link::KoheseUser::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.children2.unlink() instead.
            "::unlink::KoheseUser::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children2.exists() instead.
            "::exists::KoheseUser::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use KoheseUser.parent() instead.
            "::get::KoheseUser::parent": {
              url: urlBase + "/KoheseUsers/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children() instead.
            "::get::KoheseUser::children": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/children",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children.create() instead.
            "::create::KoheseUser::children": {
              url: urlBase + "/KoheseUsers/:id/children",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.children.createMany() instead.
            "::createMany::KoheseUser::children": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/children",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.children.destroyAll() instead.
            "::delete::KoheseUser::children": {
              url: urlBase + "/KoheseUsers/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children.count() instead.
            "::count::KoheseUser::children": {
              url: urlBase + "/KoheseUsers/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children2() instead.
            "::get::KoheseUser::children2": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children2.create() instead.
            "::create::KoheseUser::children2": {
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.children2.createMany() instead.
            "::createMany::KoheseUser::children2": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.children2.destroyAll() instead.
            "::delete::KoheseUser::children2": {
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children2.count() instead.
            "::count::KoheseUser::children2": {
              url: urlBase + "/KoheseUsers/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Category.children.findById() instead.
            "::findById::Category::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Category.children.destroyById() instead.
            "::destroyById::Category::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children.updateById() instead.
            "::updateById::Category::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Category.children2.findById() instead.
            "::findById::Category::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Category.children2.destroyById() instead.
            "::destroyById::Category::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children2.updateById() instead.
            "::updateById::Category::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Category.children2.link() instead.
            "::link::Category::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Category.children2.unlink() instead.
            "::unlink::Category::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children2.exists() instead.
            "::exists::Category::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Category.parent() instead.
            "::get::Category::parent": {
              url: urlBase + "/Categories/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Category.children() instead.
            "::get::Category::children": {
              isArray: true,
              url: urlBase + "/Categories/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Category.children.create() instead.
            "::create::Category::children": {
              url: urlBase + "/Categories/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Category.children.createMany() instead.
            "::createMany::Category::children": {
              isArray: true,
              url: urlBase + "/Categories/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Category.children.destroyAll() instead.
            "::delete::Category::children": {
              url: urlBase + "/Categories/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children.count() instead.
            "::count::Category::children": {
              url: urlBase + "/Categories/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Category.children2() instead.
            "::get::Category::children2": {
              isArray: true,
              url: urlBase + "/Categories/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Category.children2.create() instead.
            "::create::Category::children2": {
              url: urlBase + "/Categories/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Category.children2.createMany() instead.
            "::createMany::Category::children2": {
              isArray: true,
              url: urlBase + "/Categories/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Category.children2.destroyAll() instead.
            "::delete::Category::children2": {
              url: urlBase + "/Categories/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children2.count() instead.
            "::count::Category::children2": {
              url: urlBase + "/Categories/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Decision.children.findById() instead.
            "::findById::Decision::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Decision.children.destroyById() instead.
            "::destroyById::Decision::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children.updateById() instead.
            "::updateById::Decision::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Decision.children2.findById() instead.
            "::findById::Decision::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Decision.children2.destroyById() instead.
            "::destroyById::Decision::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children2.updateById() instead.
            "::updateById::Decision::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Decision.children2.link() instead.
            "::link::Decision::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Decision.children2.unlink() instead.
            "::unlink::Decision::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children2.exists() instead.
            "::exists::Decision::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Decision.parent() instead.
            "::get::Decision::parent": {
              url: urlBase + "/Decisions/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Decision.children() instead.
            "::get::Decision::children": {
              isArray: true,
              url: urlBase + "/Decisions/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Decision.children.create() instead.
            "::create::Decision::children": {
              url: urlBase + "/Decisions/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Decision.children.createMany() instead.
            "::createMany::Decision::children": {
              isArray: true,
              url: urlBase + "/Decisions/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Decision.children.destroyAll() instead.
            "::delete::Decision::children": {
              url: urlBase + "/Decisions/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children.count() instead.
            "::count::Decision::children": {
              url: urlBase + "/Decisions/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Decision.children2() instead.
            "::get::Decision::children2": {
              isArray: true,
              url: urlBase + "/Decisions/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Decision.children2.create() instead.
            "::create::Decision::children2": {
              url: urlBase + "/Decisions/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Decision.children2.createMany() instead.
            "::createMany::Decision::children2": {
              isArray: true,
              url: urlBase + "/Decisions/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Decision.children2.destroyAll() instead.
            "::delete::Decision::children2": {
              url: urlBase + "/Decisions/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children2.count() instead.
            "::count::Decision::children2": {
              url: urlBase + "/Decisions/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Action.children.findById() instead.
            "::findById::Action::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Action.children.destroyById() instead.
            "::destroyById::Action::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children.updateById() instead.
            "::updateById::Action::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Action.children2.findById() instead.
            "::findById::Action::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Action.children2.destroyById() instead.
            "::destroyById::Action::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children2.updateById() instead.
            "::updateById::Action::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Action.children2.link() instead.
            "::link::Action::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Action.children2.unlink() instead.
            "::unlink::Action::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children2.exists() instead.
            "::exists::Action::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Action.parent() instead.
            "::get::Action::parent": {
              url: urlBase + "/Actions/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Action.children() instead.
            "::get::Action::children": {
              isArray: true,
              url: urlBase + "/Actions/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Action.children.create() instead.
            "::create::Action::children": {
              url: urlBase + "/Actions/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Action.children.createMany() instead.
            "::createMany::Action::children": {
              isArray: true,
              url: urlBase + "/Actions/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Action.children.destroyAll() instead.
            "::delete::Action::children": {
              url: urlBase + "/Actions/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children.count() instead.
            "::count::Action::children": {
              url: urlBase + "/Actions/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Action.children2() instead.
            "::get::Action::children2": {
              isArray: true,
              url: urlBase + "/Actions/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Action.children2.create() instead.
            "::create::Action::children2": {
              url: urlBase + "/Actions/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Action.children2.createMany() instead.
            "::createMany::Action::children2": {
              isArray: true,
              url: urlBase + "/Actions/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Action.children2.destroyAll() instead.
            "::delete::Action::children2": {
              url: urlBase + "/Actions/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children2.count() instead.
            "::count::Action::children2": {
              url: urlBase + "/Actions/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Observation.children.findById() instead.
            "::findById::Observation::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Observation.children.destroyById() instead.
            "::destroyById::Observation::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children.updateById() instead.
            "::updateById::Observation::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Observation.children2.findById() instead.
            "::findById::Observation::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Observation.children2.destroyById() instead.
            "::destroyById::Observation::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children2.updateById() instead.
            "::updateById::Observation::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Observation.children2.link() instead.
            "::link::Observation::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Observation.children2.unlink() instead.
            "::unlink::Observation::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children2.exists() instead.
            "::exists::Observation::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Observation.parent() instead.
            "::get::Observation::parent": {
              url: urlBase + "/Observations/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Observation.children() instead.
            "::get::Observation::children": {
              isArray: true,
              url: urlBase + "/Observations/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Observation.children.create() instead.
            "::create::Observation::children": {
              url: urlBase + "/Observations/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Observation.children.createMany() instead.
            "::createMany::Observation::children": {
              isArray: true,
              url: urlBase + "/Observations/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Observation.children.destroyAll() instead.
            "::delete::Observation::children": {
              url: urlBase + "/Observations/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children.count() instead.
            "::count::Observation::children": {
              url: urlBase + "/Observations/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Observation.children2() instead.
            "::get::Observation::children2": {
              isArray: true,
              url: urlBase + "/Observations/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Observation.children2.create() instead.
            "::create::Observation::children2": {
              url: urlBase + "/Observations/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Observation.children2.createMany() instead.
            "::createMany::Observation::children2": {
              isArray: true,
              url: urlBase + "/Observations/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Observation.children2.destroyAll() instead.
            "::delete::Observation::children2": {
              url: urlBase + "/Observations/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children2.count() instead.
            "::count::Observation::children2": {
              url: urlBase + "/Observations/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Issue.children.findById() instead.
            "::findById::Issue::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Issue.children.destroyById() instead.
            "::destroyById::Issue::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children.updateById() instead.
            "::updateById::Issue::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Issue.children2.findById() instead.
            "::findById::Issue::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Issue.children2.destroyById() instead.
            "::destroyById::Issue::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children2.updateById() instead.
            "::updateById::Issue::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Issue.children2.link() instead.
            "::link::Issue::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Issue.children2.unlink() instead.
            "::unlink::Issue::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children2.exists() instead.
            "::exists::Issue::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Issue.parent() instead.
            "::get::Issue::parent": {
              url: urlBase + "/Issues/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Issue.children() instead.
            "::get::Issue::children": {
              isArray: true,
              url: urlBase + "/Issues/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Issue.children.create() instead.
            "::create::Issue::children": {
              url: urlBase + "/Issues/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Issue.children.createMany() instead.
            "::createMany::Issue::children": {
              isArray: true,
              url: urlBase + "/Issues/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Issue.children.destroyAll() instead.
            "::delete::Issue::children": {
              url: urlBase + "/Issues/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children.count() instead.
            "::count::Issue::children": {
              url: urlBase + "/Issues/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Issue.children2() instead.
            "::get::Issue::children2": {
              isArray: true,
              url: urlBase + "/Issues/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Issue.children2.create() instead.
            "::create::Issue::children2": {
              url: urlBase + "/Issues/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Issue.children2.createMany() instead.
            "::createMany::Issue::children2": {
              isArray: true,
              url: urlBase + "/Issues/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Issue.children2.destroyAll() instead.
            "::delete::Issue::children2": {
              url: urlBase + "/Issues/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children2.count() instead.
            "::count::Issue::children2": {
              url: urlBase + "/Issues/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Task.children.findById() instead.
            "::findById::Task::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Task.children.destroyById() instead.
            "::destroyById::Task::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children.updateById() instead.
            "::updateById::Task::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Task.children2.findById() instead.
            "::findById::Task::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Task.children2.destroyById() instead.
            "::destroyById::Task::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children2.updateById() instead.
            "::updateById::Task::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Task.children2.link() instead.
            "::link::Task::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Task.children2.unlink() instead.
            "::unlink::Task::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children2.exists() instead.
            "::exists::Task::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Task.parent() instead.
            "::get::Task::parent": {
              url: urlBase + "/Tasks/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Task.children() instead.
            "::get::Task::children": {
              isArray: true,
              url: urlBase + "/Tasks/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Task.children.create() instead.
            "::create::Task::children": {
              url: urlBase + "/Tasks/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Task.children.createMany() instead.
            "::createMany::Task::children": {
              isArray: true,
              url: urlBase + "/Tasks/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Task.children.destroyAll() instead.
            "::delete::Task::children": {
              url: urlBase + "/Tasks/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children.count() instead.
            "::count::Task::children": {
              url: urlBase + "/Tasks/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Task.children2() instead.
            "::get::Task::children2": {
              isArray: true,
              url: urlBase + "/Tasks/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Task.children2.create() instead.
            "::create::Task::children2": {
              url: urlBase + "/Tasks/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Task.children2.createMany() instead.
            "::createMany::Task::children2": {
              isArray: true,
              url: urlBase + "/Tasks/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Task.children2.destroyAll() instead.
            "::delete::Task::children2": {
              url: urlBase + "/Tasks/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children2.count() instead.
            "::count::Task::children2": {
              url: urlBase + "/Tasks/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use Repository.children.findById() instead.
            "::findById::Repository::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Repository.children.destroyById() instead.
            "::destroyById::Repository::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children.updateById() instead.
            "::updateById::Repository::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Repository.children2.findById() instead.
            "::findById::Repository::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Repository.children2.destroyById() instead.
            "::destroyById::Repository::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children2.updateById() instead.
            "::updateById::Repository::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Repository.children2.link() instead.
            "::link::Repository::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Repository.children2.unlink() instead.
            "::unlink::Repository::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children2.exists() instead.
            "::exists::Repository::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Repository.parent() instead.
            "::get::Repository::parent": {
              url: urlBase + "/Repositories/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Repository.children() instead.
            "::get::Repository::children": {
              isArray: true,
              url: urlBase + "/Repositories/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Repository.children.create() instead.
            "::create::Repository::children": {
              url: urlBase + "/Repositories/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Repository.children.createMany() instead.
            "::createMany::Repository::children": {
              isArray: true,
              url: urlBase + "/Repositories/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Repository.children.destroyAll() instead.
            "::delete::Repository::children": {
              url: urlBase + "/Repositories/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children.count() instead.
            "::count::Repository::children": {
              url: urlBase + "/Repositories/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Repository.children2() instead.
            "::get::Repository::children2": {
              isArray: true,
              url: urlBase + "/Repositories/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Repository.children2.create() instead.
            "::create::Repository::children2": {
              url: urlBase + "/Repositories/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Repository.children2.createMany() instead.
            "::createMany::Repository::children2": {
              isArray: true,
              url: urlBase + "/Repositories/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Repository.children2.destroyAll() instead.
            "::delete::Repository::children2": {
              url: urlBase + "/Repositories/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children2.count() instead.
            "::count::Repository::children2": {
              url: urlBase + "/Repositories/:id/children2/count",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children.findById() instead.
            "::findById::KoheseModel::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children.destroyById() instead.
            "::destroyById::KoheseModel::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children.updateById() instead.
            "::updateById::KoheseModel::children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.children2.findById() instead.
            "::findById::KoheseModel::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children2.destroyById() instead.
            "::destroyById::KoheseModel::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children2.updateById() instead.
            "::updateById::KoheseModel::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.children2.link() instead.
            "::link::KoheseModel::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.children2.unlink() instead.
            "::unlink::KoheseModel::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children2.exists() instead.
            "::exists::KoheseModel::children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use KoheseModel.parent() instead.
            "::get::KoheseModel::parent": {
              url: urlBase + "/KoheseModels/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children() instead.
            "::get::KoheseModel::children": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/children",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children.create() instead.
            "::create::KoheseModel::children": {
              url: urlBase + "/KoheseModels/:id/children",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.children.createMany() instead.
            "::createMany::KoheseModel::children": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/children",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.children.destroyAll() instead.
            "::delete::KoheseModel::children": {
              url: urlBase + "/KoheseModels/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children.count() instead.
            "::count::KoheseModel::children": {
              url: urlBase + "/KoheseModels/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children2() instead.
            "::get::KoheseModel::children2": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children2.create() instead.
            "::create::KoheseModel::children2": {
              url: urlBase + "/KoheseModels/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.children2.createMany() instead.
            "::createMany::KoheseModel::children2": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.children2.destroyAll() instead.
            "::delete::KoheseModel::children2": {
              url: urlBase + "/KoheseModels/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children2.count() instead.
            "::count::KoheseModel::children2": {
              url: urlBase + "/KoheseModels/:id/children2/count",
              method: "GET",
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
             * The number of instances updated
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Item` object.)
             * </em>
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Item` object.)
             * </em>
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
        R.children = function() {
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
        R.children.count = function() {
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Item::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Item.children#createMany
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Item::children"];
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
        R.children.destroyAll = function() {
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
        R.children.destroyById = function() {
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
        R.children.findById = function() {
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
        R.children.updateById = function() {
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
        R.children2 = function() {
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
        R.children2.count = function() {
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Item::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Item.children2#createMany
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Item::children2"];
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
        R.children2.destroyAll = function() {
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
        R.children2.destroyById = function() {
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
        R.children2.exists = function() {
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
        R.children2.findById = function() {
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
        R.children2.link = function() {
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
        R.children2.unlink = function() {
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
        R.children2.updateById = function() {
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
        R.parent = function() {
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
        R.analysis = function() {
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Item::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Item.analysis#createMany
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
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Item::analysis"];
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
        R.analysis.destroy = function() {
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Item::analysis"];
          return action.apply(R, arguments);
        };


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
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Analyses/:id",
          { 'id': '@id' },
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
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Analysis#createMany
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
            "createMany": {
              isArray: true,
              url: urlBase + "/Analyses",
              method: "POST",
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
              method: "PUT",
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
              method: "GET",
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
              method: "GET",
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
              method: "GET",
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
              method: "GET",
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Analyses/update",
              method: "POST",
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Analyses/:id",
              method: "DELETE",
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
              method: "GET",
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
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Analysis#createChangeStream
             * @methodOf lbServices.Analysis
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Analyses/change-stream",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Analysis#performAnalysis
             * @methodOf lbServices.Analysis
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
             *  - `req` – `{object=}` -
             *
             *  - `forModelKind` – `{string=}` -
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
              url: urlBase + "/Analyses/performAnalysis",
              method: "POST",
            },

            // INTERNAL. Use Item.analysis() instead.
            "::get::Item::analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Item.analysis.create() instead.
            "::create::Item::analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Item.analysis.createMany() instead.
            "::createMany::Item::analysis": {
              isArray: true,
              url: urlBase + "/Items/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Item.analysis.update() instead.
            "::update::Item::analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Item.analysis.destroy() instead.
            "::destroy::Item::analysis": {
              url: urlBase + "/Items/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.analysis() instead.
            "::get::KoheseUser::analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.analysis.create() instead.
            "::create::KoheseUser::analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.analysis.createMany() instead.
            "::createMany::KoheseUser::analysis": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.analysis.update() instead.
            "::update::KoheseUser::analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.analysis.destroy() instead.
            "::destroy::KoheseUser::analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Category.analysis() instead.
            "::get::Category::analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Category.analysis.create() instead.
            "::create::Category::analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Category.analysis.createMany() instead.
            "::createMany::Category::analysis": {
              isArray: true,
              url: urlBase + "/Categories/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Category.analysis.update() instead.
            "::update::Category::analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Category.analysis.destroy() instead.
            "::destroy::Category::analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.analysis() instead.
            "::get::Decision::analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Decision.analysis.create() instead.
            "::create::Decision::analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Decision.analysis.createMany() instead.
            "::createMany::Decision::analysis": {
              isArray: true,
              url: urlBase + "/Decisions/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Decision.analysis.update() instead.
            "::update::Decision::analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Decision.analysis.destroy() instead.
            "::destroy::Decision::analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Action.analysis() instead.
            "::get::Action::analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Action.analysis.create() instead.
            "::create::Action::analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Action.analysis.createMany() instead.
            "::createMany::Action::analysis": {
              isArray: true,
              url: urlBase + "/Actions/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Action.analysis.update() instead.
            "::update::Action::analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Action.analysis.destroy() instead.
            "::destroy::Action::analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.analysis() instead.
            "::get::Observation::analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Observation.analysis.create() instead.
            "::create::Observation::analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Observation.analysis.createMany() instead.
            "::createMany::Observation::analysis": {
              isArray: true,
              url: urlBase + "/Observations/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Observation.analysis.update() instead.
            "::update::Observation::analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Observation.analysis.destroy() instead.
            "::destroy::Observation::analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.analysis() instead.
            "::get::Issue::analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Issue.analysis.create() instead.
            "::create::Issue::analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Issue.analysis.createMany() instead.
            "::createMany::Issue::analysis": {
              isArray: true,
              url: urlBase + "/Issues/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Issue.analysis.update() instead.
            "::update::Issue::analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Issue.analysis.destroy() instead.
            "::destroy::Issue::analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Task.analysis() instead.
            "::get::Task::analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Task.analysis.create() instead.
            "::create::Task::analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Task.analysis.createMany() instead.
            "::createMany::Task::analysis": {
              isArray: true,
              url: urlBase + "/Tasks/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Task.analysis.update() instead.
            "::update::Task::analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Task.analysis.destroy() instead.
            "::destroy::Task::analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.analysis() instead.
            "::get::Repository::analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Repository.analysis.create() instead.
            "::create::Repository::analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Repository.analysis.createMany() instead.
            "::createMany::Repository::analysis": {
              isArray: true,
              url: urlBase + "/Repositories/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Repository.analysis.update() instead.
            "::update::Repository::analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Repository.analysis.destroy() instead.
            "::destroy::Repository::analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.analysis() instead.
            "::get::KoheseModel::analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.analysis.create() instead.
            "::create::KoheseModel::analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.analysis.createMany() instead.
            "::createMany::KoheseModel::analysis": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.analysis.update() instead.
            "::update::KoheseModel::analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.analysis.destroy() instead.
            "::destroy::KoheseModel::analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "DELETE",
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
             * The number of instances updated
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Analysis` object.)
             * </em>
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Analysis` object.)
             * </em>
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

/**
 * @ngdoc object
 * @name lbServices.KoheseUser
 * @header lbServices.KoheseUser
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `KoheseUser` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "KoheseUser",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/KoheseUsers/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use KoheseUser.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseUsers/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use KoheseUser.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/KoheseUsers/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use KoheseUser.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/KoheseUsers/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/children",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/KoheseUsers/:id/children",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/KoheseUsers/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/KoheseUsers/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use KoheseUser.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use KoheseUser.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/KoheseUsers/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseUser.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/KoheseUsers/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#create
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/KoheseUsers",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#createMany
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/KoheseUsers",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#upsert
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/KoheseUsers",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#exists
             * @methodOf lbServices.KoheseUser
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
              url: urlBase + "/KoheseUsers/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#findById
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/KoheseUsers/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#find
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/KoheseUsers",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#findOne
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/KoheseUsers/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#updateAll
             * @methodOf lbServices.KoheseUser
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/KoheseUsers/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#deleteById
             * @methodOf lbServices.KoheseUser
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/KoheseUsers/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#count
             * @methodOf lbServices.KoheseUser
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
              url: urlBase + "/KoheseUsers/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#prototype$updateAttributes
             * @methodOf lbServices.KoheseUser
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/KoheseUsers/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#createChangeStream
             * @methodOf lbServices.KoheseUser
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/KoheseUsers/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#updateOrCreate
             * @methodOf lbServices.KoheseUser
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
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#update
             * @methodOf lbServices.KoheseUser
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#destroyById
             * @methodOf lbServices.KoheseUser
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#removeById
             * @methodOf lbServices.KoheseUser
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `KoheseUser` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.KoheseUser#modelName
        * @propertyOf lbServices.KoheseUser
        * @description
        * The name of the model represented by this $resource,
        * i.e. `KoheseUser`.
        */
        R.modelName = "KoheseUser";

    /**
     * @ngdoc object
     * @name lbServices.KoheseUser.children
     * @header lbServices.KoheseUser.children
     * @object
     * @description
     *
     * The object `KoheseUser.children` groups methods
     * manipulating `Item` instances related to `KoheseUser`.
     *
     * Call {@link lbServices.KoheseUser#children KoheseUser.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#children
             * @methodOf lbServices.KoheseUser
             *
             * @description
             *
             * Queries children of KoheseUser.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#count
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Counts children of KoheseUser.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#create
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#createMany
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#destroyAll
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#destroyById
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#findById
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::KoheseUser::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children#updateById
             * @methodOf lbServices.KoheseUser.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::KoheseUser::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.KoheseUser.children2
     * @header lbServices.KoheseUser.children2
     * @object
     * @description
     *
     * The object `KoheseUser.children2` groups methods
     * manipulating `Item` instances related to `KoheseUser`.
     *
     * Call {@link lbServices.KoheseUser#children2 KoheseUser.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#children2
             * @methodOf lbServices.KoheseUser
             *
             * @description
             *
             * Queries children2 of KoheseUser.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#count
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Counts children2 of KoheseUser.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#create
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#createMany
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#destroyAll
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#destroyById
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#exists
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#findById
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#link
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#unlink
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.children2#updateById
             * @methodOf lbServices.KoheseUser.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::KoheseUser::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#parent
             * @methodOf lbServices.KoheseUser
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::KoheseUser::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.KoheseUser.analysis
     * @header lbServices.KoheseUser.analysis
     * @object
     * @description
     *
     * The object `KoheseUser.analysis` groups methods
     * manipulating `Analysis` instances related to `KoheseUser`.
     *
     * Call {@link lbServices.KoheseUser#analysis KoheseUser.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.KoheseUser#analysis
             * @methodOf lbServices.KoheseUser
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::KoheseUser::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.analysis#create
             * @methodOf lbServices.KoheseUser.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::KoheseUser::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.analysis#createMany
             * @methodOf lbServices.KoheseUser.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::KoheseUser::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.analysis#destroy
             * @methodOf lbServices.KoheseUser.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::KoheseUser::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseUser.analysis#update
             * @methodOf lbServices.KoheseUser.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::KoheseUser::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Category
 * @header lbServices.Category
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Category` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Category",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Categories/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Category.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Category.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Category.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Category.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Category.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Category.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Categories/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Category.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Categories/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Category.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Category.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Category.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Category.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Categories/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Categories/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Category.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Categories/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Category.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Categories/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Categories/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Category.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Categories/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Category.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Categories/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Category.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Categories/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Category.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Categories/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#create
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Categories",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#createMany
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Categories",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#upsert
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Categories",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#exists
             * @methodOf lbServices.Category
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
              url: urlBase + "/Categories/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#findById
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Categories/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#find
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Categories",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#findOne
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Categories/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#updateAll
             * @methodOf lbServices.Category
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Categories/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#deleteById
             * @methodOf lbServices.Category
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Categories/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#count
             * @methodOf lbServices.Category
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
              url: urlBase + "/Categories/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#prototype$updateAttributes
             * @methodOf lbServices.Category
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Categories/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Category#createChangeStream
             * @methodOf lbServices.Category
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Categories/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Category#updateOrCreate
             * @methodOf lbServices.Category
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
             * This usually means the response is a `Category` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Category#update
             * @methodOf lbServices.Category
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Category#destroyById
             * @methodOf lbServices.Category
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Category` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Category#removeById
             * @methodOf lbServices.Category
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Category` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Category#modelName
        * @propertyOf lbServices.Category
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Category`.
        */
        R.modelName = "Category";

    /**
     * @ngdoc object
     * @name lbServices.Category.children
     * @header lbServices.Category.children
     * @object
     * @description
     *
     * The object `Category.children` groups methods
     * manipulating `Item` instances related to `Category`.
     *
     * Call {@link lbServices.Category#children Category.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Category#children
             * @methodOf lbServices.Category
             *
             * @description
             *
             * Queries children of Category.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#count
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Counts children of Category.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#create
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#createMany
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#destroyAll
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#destroyById
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#findById
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Category::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children#updateById
             * @methodOf lbServices.Category.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Category::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Category.children2
     * @header lbServices.Category.children2
     * @object
     * @description
     *
     * The object `Category.children2` groups methods
     * manipulating `Item` instances related to `Category`.
     *
     * Call {@link lbServices.Category#children2 Category.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Category#children2
             * @methodOf lbServices.Category
             *
             * @description
             *
             * Queries children2 of Category.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#count
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Counts children2 of Category.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#create
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#createMany
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#destroyAll
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#destroyById
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#exists
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#findById
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#link
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#unlink
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.children2#updateById
             * @methodOf lbServices.Category.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Category::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category#parent
             * @methodOf lbServices.Category
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Category::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Category.analysis
     * @header lbServices.Category.analysis
     * @object
     * @description
     *
     * The object `Category.analysis` groups methods
     * manipulating `Analysis` instances related to `Category`.
     *
     * Call {@link lbServices.Category#analysis Category.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Category#analysis
             * @methodOf lbServices.Category
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Category::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.analysis#create
             * @methodOf lbServices.Category.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Category::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.analysis#createMany
             * @methodOf lbServices.Category.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Category::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.analysis#destroy
             * @methodOf lbServices.Category.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Category::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Category.analysis#update
             * @methodOf lbServices.Category.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Category::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Decision
 * @header lbServices.Decision
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Decision` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Decision",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Decisions/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Decision.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Decision.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Decision.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Decision.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Decision.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Decision.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Decisions/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Decision.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Decisions/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Decision.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Decision.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Decision.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Decision.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Decisions/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Decisions/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Decision.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Decisions/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Decision.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Decisions/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Decisions/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Decision.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Decisions/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Decision.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Decisions/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Decision.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Decisions/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Decision.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Decisions/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#create
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Decisions",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#createMany
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Decisions",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#upsert
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Decisions",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#exists
             * @methodOf lbServices.Decision
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
              url: urlBase + "/Decisions/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#findById
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Decisions/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#find
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Decisions",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#findOne
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Decisions/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#updateAll
             * @methodOf lbServices.Decision
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Decisions/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#deleteById
             * @methodOf lbServices.Decision
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Decisions/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#count
             * @methodOf lbServices.Decision
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
              url: urlBase + "/Decisions/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#prototype$updateAttributes
             * @methodOf lbServices.Decision
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Decisions/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Decision#createChangeStream
             * @methodOf lbServices.Decision
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Decisions/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Decision#updateOrCreate
             * @methodOf lbServices.Decision
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
             * This usually means the response is a `Decision` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Decision#update
             * @methodOf lbServices.Decision
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Decision#destroyById
             * @methodOf lbServices.Decision
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Decision` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Decision#removeById
             * @methodOf lbServices.Decision
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Decision` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Decision#modelName
        * @propertyOf lbServices.Decision
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Decision`.
        */
        R.modelName = "Decision";

    /**
     * @ngdoc object
     * @name lbServices.Decision.children
     * @header lbServices.Decision.children
     * @object
     * @description
     *
     * The object `Decision.children` groups methods
     * manipulating `Item` instances related to `Decision`.
     *
     * Call {@link lbServices.Decision#children Decision.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Decision#children
             * @methodOf lbServices.Decision
             *
             * @description
             *
             * Queries children of Decision.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#count
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Counts children of Decision.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#create
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#createMany
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#destroyAll
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#destroyById
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#findById
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Decision::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children#updateById
             * @methodOf lbServices.Decision.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Decision::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Decision.children2
     * @header lbServices.Decision.children2
     * @object
     * @description
     *
     * The object `Decision.children2` groups methods
     * manipulating `Item` instances related to `Decision`.
     *
     * Call {@link lbServices.Decision#children2 Decision.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Decision#children2
             * @methodOf lbServices.Decision
             *
             * @description
             *
             * Queries children2 of Decision.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#count
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Counts children2 of Decision.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#create
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#createMany
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#destroyAll
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#destroyById
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#exists
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#findById
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#link
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#unlink
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.children2#updateById
             * @methodOf lbServices.Decision.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Decision::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision#parent
             * @methodOf lbServices.Decision
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Decision::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Decision.analysis
     * @header lbServices.Decision.analysis
     * @object
     * @description
     *
     * The object `Decision.analysis` groups methods
     * manipulating `Analysis` instances related to `Decision`.
     *
     * Call {@link lbServices.Decision#analysis Decision.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Decision#analysis
             * @methodOf lbServices.Decision
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Decision::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.analysis#create
             * @methodOf lbServices.Decision.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Decision::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.analysis#createMany
             * @methodOf lbServices.Decision.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Decision::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.analysis#destroy
             * @methodOf lbServices.Decision.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Decision::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Decision.analysis#update
             * @methodOf lbServices.Decision.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Decision::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Action
 * @header lbServices.Action
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Action` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Action",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Actions/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Action.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Action.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Action.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Action.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Action.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Action.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Actions/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Action.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Actions/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Action.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Action.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Action.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Action.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Actions/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Actions/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Action.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Actions/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Action.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Actions/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Actions/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Action.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Actions/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Action.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Actions/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Action.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Actions/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Action.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Actions/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#create
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Actions",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#createMany
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Actions",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#upsert
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Actions",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#exists
             * @methodOf lbServices.Action
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
              url: urlBase + "/Actions/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#findById
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Actions/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#find
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Actions",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#findOne
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Actions/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#updateAll
             * @methodOf lbServices.Action
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Actions/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#deleteById
             * @methodOf lbServices.Action
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Actions/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#count
             * @methodOf lbServices.Action
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
              url: urlBase + "/Actions/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#prototype$updateAttributes
             * @methodOf lbServices.Action
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Actions/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Action#createChangeStream
             * @methodOf lbServices.Action
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Actions/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Action#updateOrCreate
             * @methodOf lbServices.Action
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
             * This usually means the response is a `Action` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Action#update
             * @methodOf lbServices.Action
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Action#destroyById
             * @methodOf lbServices.Action
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Action` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Action#removeById
             * @methodOf lbServices.Action
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Action` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Action#modelName
        * @propertyOf lbServices.Action
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Action`.
        */
        R.modelName = "Action";

    /**
     * @ngdoc object
     * @name lbServices.Action.children
     * @header lbServices.Action.children
     * @object
     * @description
     *
     * The object `Action.children` groups methods
     * manipulating `Item` instances related to `Action`.
     *
     * Call {@link lbServices.Action#children Action.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Action#children
             * @methodOf lbServices.Action
             *
             * @description
             *
             * Queries children of Action.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#count
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Counts children of Action.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#create
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#createMany
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#destroyAll
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#destroyById
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#findById
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Action::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children#updateById
             * @methodOf lbServices.Action.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Action::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Action.children2
     * @header lbServices.Action.children2
     * @object
     * @description
     *
     * The object `Action.children2` groups methods
     * manipulating `Item` instances related to `Action`.
     *
     * Call {@link lbServices.Action#children2 Action.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Action#children2
             * @methodOf lbServices.Action
             *
             * @description
             *
             * Queries children2 of Action.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#count
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Counts children2 of Action.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#create
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#createMany
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#destroyAll
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#destroyById
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#exists
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#findById
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#link
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#unlink
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.children2#updateById
             * @methodOf lbServices.Action.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Action::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action#parent
             * @methodOf lbServices.Action
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Action::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Action.analysis
     * @header lbServices.Action.analysis
     * @object
     * @description
     *
     * The object `Action.analysis` groups methods
     * manipulating `Analysis` instances related to `Action`.
     *
     * Call {@link lbServices.Action#analysis Action.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Action#analysis
             * @methodOf lbServices.Action
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Action::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.analysis#create
             * @methodOf lbServices.Action.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Action::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.analysis#createMany
             * @methodOf lbServices.Action.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Action::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.analysis#destroy
             * @methodOf lbServices.Action.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Action::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Action.analysis#update
             * @methodOf lbServices.Action.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Decision id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Action::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Observation
 * @header lbServices.Observation
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Observation` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Observation",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Observations/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Observation.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Observation.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Observation.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Observation.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Observation.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Observation.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Observations/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Observation.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Observations/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Observation.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Observation.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Observation.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Observation.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Observations/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Observations/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Observation.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Observations/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Observation.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Observations/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Observations/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Observation.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Observations/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Observation.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Observations/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Observation.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Observations/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Observation.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Observations/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#create
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Observations",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#createMany
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Observations",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#upsert
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Observations",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#exists
             * @methodOf lbServices.Observation
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
              url: urlBase + "/Observations/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#findById
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Observations/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#find
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Observations",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#findOne
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Observations/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#updateAll
             * @methodOf lbServices.Observation
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Observations/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#deleteById
             * @methodOf lbServices.Observation
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Observations/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#count
             * @methodOf lbServices.Observation
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
              url: urlBase + "/Observations/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#prototype$updateAttributes
             * @methodOf lbServices.Observation
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Observations/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Observation#createChangeStream
             * @methodOf lbServices.Observation
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Observations/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Observation#updateOrCreate
             * @methodOf lbServices.Observation
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
             * This usually means the response is a `Observation` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Observation#update
             * @methodOf lbServices.Observation
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Observation#destroyById
             * @methodOf lbServices.Observation
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Observation` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Observation#removeById
             * @methodOf lbServices.Observation
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Observation` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Observation#modelName
        * @propertyOf lbServices.Observation
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Observation`.
        */
        R.modelName = "Observation";

    /**
     * @ngdoc object
     * @name lbServices.Observation.children
     * @header lbServices.Observation.children
     * @object
     * @description
     *
     * The object `Observation.children` groups methods
     * manipulating `Item` instances related to `Observation`.
     *
     * Call {@link lbServices.Observation#children Observation.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Observation#children
             * @methodOf lbServices.Observation
             *
             * @description
             *
             * Queries children of Observation.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#count
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Counts children of Observation.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#create
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#createMany
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#destroyAll
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#destroyById
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#findById
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Observation::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children#updateById
             * @methodOf lbServices.Observation.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Observation::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Observation.children2
     * @header lbServices.Observation.children2
     * @object
     * @description
     *
     * The object `Observation.children2` groups methods
     * manipulating `Item` instances related to `Observation`.
     *
     * Call {@link lbServices.Observation#children2 Observation.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Observation#children2
             * @methodOf lbServices.Observation
             *
             * @description
             *
             * Queries children2 of Observation.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#count
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Counts children2 of Observation.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#create
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#createMany
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#destroyAll
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#destroyById
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#exists
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#findById
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#link
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#unlink
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.children2#updateById
             * @methodOf lbServices.Observation.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Observation::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation#parent
             * @methodOf lbServices.Observation
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Observation::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Observation.analysis
     * @header lbServices.Observation.analysis
     * @object
     * @description
     *
     * The object `Observation.analysis` groups methods
     * manipulating `Analysis` instances related to `Observation`.
     *
     * Call {@link lbServices.Observation#analysis Observation.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Observation#analysis
             * @methodOf lbServices.Observation
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Observation::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.analysis#create
             * @methodOf lbServices.Observation.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Observation::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.analysis#createMany
             * @methodOf lbServices.Observation.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Observation::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.analysis#destroy
             * @methodOf lbServices.Observation.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Observation::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Observation.analysis#update
             * @methodOf lbServices.Observation.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Observation::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Issue
 * @header lbServices.Issue
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Issue` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Issue",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Issues/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Issue.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Issue.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Issue.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Issue.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Issue.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Issue.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Issues/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Issue.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Issues/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Issue.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Issue.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Issue.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Issue.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Issues/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Issues/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Issue.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Issues/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Issue.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Issues/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Issues/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Issue.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Issues/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Issue.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Issues/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Issue.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Issues/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Issue.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Issues/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#create
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Issues",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#createMany
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Issues",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#upsert
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Issues",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#exists
             * @methodOf lbServices.Issue
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
              url: urlBase + "/Issues/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#findById
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Issues/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#find
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Issues",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#findOne
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Issues/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#updateAll
             * @methodOf lbServices.Issue
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Issues/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#deleteById
             * @methodOf lbServices.Issue
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Issues/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#count
             * @methodOf lbServices.Issue
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
              url: urlBase + "/Issues/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#prototype$updateAttributes
             * @methodOf lbServices.Issue
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Issues/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Issue#createChangeStream
             * @methodOf lbServices.Issue
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Issues/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Issue#updateOrCreate
             * @methodOf lbServices.Issue
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
             * This usually means the response is a `Issue` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Issue#update
             * @methodOf lbServices.Issue
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Issue#destroyById
             * @methodOf lbServices.Issue
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Issue` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Issue#removeById
             * @methodOf lbServices.Issue
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Issue` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Issue#modelName
        * @propertyOf lbServices.Issue
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Issue`.
        */
        R.modelName = "Issue";

    /**
     * @ngdoc object
     * @name lbServices.Issue.children
     * @header lbServices.Issue.children
     * @object
     * @description
     *
     * The object `Issue.children` groups methods
     * manipulating `Item` instances related to `Issue`.
     *
     * Call {@link lbServices.Issue#children Issue.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Issue#children
             * @methodOf lbServices.Issue
             *
             * @description
             *
             * Queries children of Issue.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#count
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Counts children of Issue.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#create
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#createMany
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#destroyAll
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#destroyById
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#findById
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Issue::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children#updateById
             * @methodOf lbServices.Issue.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Issue::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Issue.children2
     * @header lbServices.Issue.children2
     * @object
     * @description
     *
     * The object `Issue.children2` groups methods
     * manipulating `Item` instances related to `Issue`.
     *
     * Call {@link lbServices.Issue#children2 Issue.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Issue#children2
             * @methodOf lbServices.Issue
             *
             * @description
             *
             * Queries children2 of Issue.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#count
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Counts children2 of Issue.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#create
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#createMany
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#destroyAll
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#destroyById
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#exists
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#findById
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#link
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#unlink
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.children2#updateById
             * @methodOf lbServices.Issue.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Issue::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue#parent
             * @methodOf lbServices.Issue
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Issue::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Issue.analysis
     * @header lbServices.Issue.analysis
     * @object
     * @description
     *
     * The object `Issue.analysis` groups methods
     * manipulating `Analysis` instances related to `Issue`.
     *
     * Call {@link lbServices.Issue#analysis Issue.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Issue#analysis
             * @methodOf lbServices.Issue
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Issue::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.analysis#create
             * @methodOf lbServices.Issue.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Issue::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.analysis#createMany
             * @methodOf lbServices.Issue.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Issue::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.analysis#destroy
             * @methodOf lbServices.Issue.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Issue::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Issue.analysis#update
             * @methodOf lbServices.Issue.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Observation id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Issue::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Task
 * @header lbServices.Task
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Task` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Task",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Tasks/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Task.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Task.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Task.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Task.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Task.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Task.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Tasks/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Task.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Tasks/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Task.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Task.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Task.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Task.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Tasks/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Tasks/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Task.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Tasks/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Task.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Tasks/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Tasks/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Task.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Tasks/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Task.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Tasks/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Task.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Tasks/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Task.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Tasks/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#create
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Tasks",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#createMany
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Tasks",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#upsert
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Tasks",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#exists
             * @methodOf lbServices.Task
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
              url: urlBase + "/Tasks/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#findById
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Tasks/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#find
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Tasks",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#findOne
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Tasks/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#updateAll
             * @methodOf lbServices.Task
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Tasks/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#deleteById
             * @methodOf lbServices.Task
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Tasks/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#count
             * @methodOf lbServices.Task
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
              url: urlBase + "/Tasks/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#prototype$updateAttributes
             * @methodOf lbServices.Task
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Tasks/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Task#createChangeStream
             * @methodOf lbServices.Task
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Tasks/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Task#updateOrCreate
             * @methodOf lbServices.Task
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
             * This usually means the response is a `Task` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Task#update
             * @methodOf lbServices.Task
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Task#destroyById
             * @methodOf lbServices.Task
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Task` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Task#removeById
             * @methodOf lbServices.Task
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Task` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Task#modelName
        * @propertyOf lbServices.Task
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Task`.
        */
        R.modelName = "Task";

    /**
     * @ngdoc object
     * @name lbServices.Task.children
     * @header lbServices.Task.children
     * @object
     * @description
     *
     * The object `Task.children` groups methods
     * manipulating `Item` instances related to `Task`.
     *
     * Call {@link lbServices.Task#children Task.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Task#children
             * @methodOf lbServices.Task
             *
             * @description
             *
             * Queries children of Task.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#count
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Counts children of Task.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#create
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#createMany
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#destroyAll
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#destroyById
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#findById
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Task::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children#updateById
             * @methodOf lbServices.Task.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Task::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Task.children2
     * @header lbServices.Task.children2
     * @object
     * @description
     *
     * The object `Task.children2` groups methods
     * manipulating `Item` instances related to `Task`.
     *
     * Call {@link lbServices.Task#children2 Task.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Task#children2
             * @methodOf lbServices.Task
             *
             * @description
             *
             * Queries children2 of Task.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#count
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Counts children2 of Task.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#create
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#createMany
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#destroyAll
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#destroyById
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#exists
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#findById
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#link
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#unlink
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.children2#updateById
             * @methodOf lbServices.Task.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Task::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task#parent
             * @methodOf lbServices.Task
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Task::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Task.analysis
     * @header lbServices.Task.analysis
     * @object
     * @description
     *
     * The object `Task.analysis` groups methods
     * manipulating `Analysis` instances related to `Task`.
     *
     * Call {@link lbServices.Task#analysis Task.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Task#analysis
             * @methodOf lbServices.Task
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Task::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.analysis#create
             * @methodOf lbServices.Task.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Task::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.analysis#createMany
             * @methodOf lbServices.Task.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Task::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.analysis#destroy
             * @methodOf lbServices.Task.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Task::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Task.analysis#update
             * @methodOf lbServices.Task.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Task::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Repository
 * @header lbServices.Repository
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Repository` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Repository",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/Repositories/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Repository.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use Repository.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Repository.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use Repository.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Repository.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Repository.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Repositories/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Repository.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/Repositories/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use Repository.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use Repository.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use Repository.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use Repository.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/Repositories/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/Repositories/:id/children",
              method: "GET",
            },

            // INTERNAL. Use Repository.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/Repositories/:id/children",
              method: "POST",
            },

            // INTERNAL. Use Repository.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/Repositories/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/Repositories/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use Repository.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/Repositories/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use Repository.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/Repositories/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use Repository.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/Repositories/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use Repository.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/Repositories/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#create
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/Repositories",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#createMany
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/Repositories",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#upsert
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/Repositories",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#exists
             * @methodOf lbServices.Repository
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
              url: urlBase + "/Repositories/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#findById
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Repositories/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#find
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Repositories",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#findOne
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/Repositories/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#updateAll
             * @methodOf lbServices.Repository
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/Repositories/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#deleteById
             * @methodOf lbServices.Repository
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Repositories/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#count
             * @methodOf lbServices.Repository
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
              url: urlBase + "/Repositories/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#prototype$updateAttributes
             * @methodOf lbServices.Repository
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/Repositories/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.Repository#createChangeStream
             * @methodOf lbServices.Repository
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/Repositories/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Repository#updateOrCreate
             * @methodOf lbServices.Repository
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
             * This usually means the response is a `Repository` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.Repository#update
             * @methodOf lbServices.Repository
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.Repository#destroyById
             * @methodOf lbServices.Repository
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Repository` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Repository#removeById
             * @methodOf lbServices.Repository
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Repository` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Repository#modelName
        * @propertyOf lbServices.Repository
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Repository`.
        */
        R.modelName = "Repository";

    /**
     * @ngdoc object
     * @name lbServices.Repository.children
     * @header lbServices.Repository.children
     * @object
     * @description
     *
     * The object `Repository.children` groups methods
     * manipulating `Item` instances related to `Repository`.
     *
     * Call {@link lbServices.Repository#children Repository.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Repository#children
             * @methodOf lbServices.Repository
             *
             * @description
             *
             * Queries children of Repository.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#count
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Counts children of Repository.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#create
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#createMany
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#destroyAll
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#destroyById
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#findById
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Repository::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children#updateById
             * @methodOf lbServices.Repository.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Repository::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Repository.children2
     * @header lbServices.Repository.children2
     * @object
     * @description
     *
     * The object `Repository.children2` groups methods
     * manipulating `Item` instances related to `Repository`.
     *
     * Call {@link lbServices.Repository#children2 Repository.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Repository#children2
             * @methodOf lbServices.Repository
             *
             * @description
             *
             * Queries children2 of Repository.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#count
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Counts children2 of Repository.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#create
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#createMany
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#destroyAll
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#destroyById
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#exists
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#findById
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#link
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#unlink
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.children2#updateById
             * @methodOf lbServices.Repository.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::Repository::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository#parent
             * @methodOf lbServices.Repository
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::Repository::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Repository.analysis
     * @header lbServices.Repository.analysis
     * @object
     * @description
     *
     * The object `Repository.analysis` groups methods
     * manipulating `Analysis` instances related to `Repository`.
     *
     * Call {@link lbServices.Repository#analysis Repository.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Repository#analysis
             * @methodOf lbServices.Repository
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::Repository::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.analysis#create
             * @methodOf lbServices.Repository.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::Repository::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.analysis#createMany
             * @methodOf lbServices.Repository.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::Repository::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.analysis#destroy
             * @methodOf lbServices.Repository.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::Repository::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Repository.analysis#update
             * @methodOf lbServices.Repository.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::Repository::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.KoheseModel
 * @header lbServices.KoheseModel
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `KoheseModel` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "KoheseModel",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector',
      function(Resource, LoopBackAuth, $injector) {
        var R = Resource(
        urlBase + "/KoheseModels/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use KoheseModel.children.findById() instead.
            "prototype$__findById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children.destroyById() instead.
            "prototype$__destroyById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children.updateById() instead.
            "prototype$__updateById__children": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.children2.findById() instead.
            "prototype$__findById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/:fk",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children2.destroyById() instead.
            "prototype$__destroyById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children2.updateById() instead.
            "prototype$__updateById__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.children2.link() instead.
            "prototype$__link__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.children2.unlink() instead.
            "prototype$__unlink__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children2.exists() instead.
            "prototype$__exists__children2": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/KoheseModels/:id/children2/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use KoheseModel.parent() instead.
            "prototype$__get__parent": {
              url: urlBase + "/KoheseModels/:id/parent",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.analysis() instead.
            "prototype$__get__analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.analysis.create() instead.
            "prototype$__create__analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.analysis.update() instead.
            "prototype$__update__analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "PUT",
            },

            // INTERNAL. Use KoheseModel.analysis.destroy() instead.
            "prototype$__destroy__analysis": {
              url: urlBase + "/KoheseModels/:id/analysis",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children() instead.
            "prototype$__get__children": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/children",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children.create() instead.
            "prototype$__create__children": {
              url: urlBase + "/KoheseModels/:id/children",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.children.destroyAll() instead.
            "prototype$__delete__children": {
              url: urlBase + "/KoheseModels/:id/children",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children.count() instead.
            "prototype$__count__children": {
              url: urlBase + "/KoheseModels/:id/children/count",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children2() instead.
            "prototype$__get__children2": {
              isArray: true,
              url: urlBase + "/KoheseModels/:id/children2",
              method: "GET",
            },

            // INTERNAL. Use KoheseModel.children2.create() instead.
            "prototype$__create__children2": {
              url: urlBase + "/KoheseModels/:id/children2",
              method: "POST",
            },

            // INTERNAL. Use KoheseModel.children2.destroyAll() instead.
            "prototype$__delete__children2": {
              url: urlBase + "/KoheseModels/:id/children2",
              method: "DELETE",
            },

            // INTERNAL. Use KoheseModel.children2.count() instead.
            "prototype$__count__children2": {
              url: urlBase + "/KoheseModels/:id/children2/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#create
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/KoheseModels",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#createMany
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/KoheseModels",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#upsert
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "upsert": {
              url: urlBase + "/KoheseModels",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#exists
             * @methodOf lbServices.KoheseModel
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
              url: urlBase + "/KoheseModels/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#findById
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/KoheseModels/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#find
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/KoheseModels",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#findOne
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/KoheseModels/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#updateAll
             * @methodOf lbServices.KoheseModel
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
             * The number of instances updated
             */
            "updateAll": {
              url: urlBase + "/KoheseModels/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#deleteById
             * @methodOf lbServices.KoheseModel
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/KoheseModels/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#count
             * @methodOf lbServices.KoheseModel
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
              url: urlBase + "/KoheseModels/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#prototype$updateAttributes
             * @methodOf lbServices.KoheseModel
             *
             * @description
             *
             * Update attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
            "prototype$updateAttributes": {
              url: urlBase + "/KoheseModels/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#createChangeStream
             * @methodOf lbServices.KoheseModel
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
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
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/KoheseModels/change-stream",
              method: "POST",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#updateOrCreate
             * @methodOf lbServices.KoheseModel
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
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
        R["updateOrCreate"] = R["upsert"];

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#update
             * @methodOf lbServices.KoheseModel
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
             * The number of instances updated
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#destroyById
             * @methodOf lbServices.KoheseModel
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#removeById
             * @methodOf lbServices.KoheseModel
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
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `KoheseModel` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.KoheseModel#modelName
        * @propertyOf lbServices.KoheseModel
        * @description
        * The name of the model represented by this $resource,
        * i.e. `KoheseModel`.
        */
        R.modelName = "KoheseModel";

    /**
     * @ngdoc object
     * @name lbServices.KoheseModel.children
     * @header lbServices.KoheseModel.children
     * @object
     * @description
     *
     * The object `KoheseModel.children` groups methods
     * manipulating `Item` instances related to `KoheseModel`.
     *
     * Call {@link lbServices.KoheseModel#children KoheseModel.children()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#children
             * @methodOf lbServices.KoheseModel
             *
             * @description
             *
             * Queries children of KoheseModel.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#count
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Counts children of KoheseModel.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#create
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#createMany
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Creates a new instance in children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#destroyAll
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Deletes all children of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#destroyById
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Delete a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#findById
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Find a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::KoheseModel::children"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children#updateById
             * @methodOf lbServices.KoheseModel.children
             *
             * @description
             *
             * Update a related item by id for children.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::KoheseModel::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.KoheseModel.children2
     * @header lbServices.KoheseModel.children2
     * @object
     * @description
     *
     * The object `KoheseModel.children2` groups methods
     * manipulating `Item` instances related to `KoheseModel`.
     *
     * Call {@link lbServices.KoheseModel#children2 KoheseModel.children2()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#children2
             * @methodOf lbServices.KoheseModel
             *
             * @description
             *
             * Queries children2 of KoheseModel.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2 = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#count
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Counts children2 of KoheseModel.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.count = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::count::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#create
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.create = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::create::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#createMany
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Creates a new instance in children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.createMany = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::createMany::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#destroyAll
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Deletes all children2 of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyAll = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::delete::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#destroyById
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Delete a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.destroyById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::destroyById::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#exists
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Check the existence of children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.exists = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::exists::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#findById
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Find a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.findById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::findById::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#link
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Add a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.link = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::link::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#unlink
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Remove the children2 relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.unlink = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::unlink::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.children2#updateById
             * @methodOf lbServices.KoheseModel.children2
             *
             * @description
             *
             * Update a related item by id for children2.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.children2.updateById = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::updateById::KoheseModel::children2"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#parent
             * @methodOf lbServices.KoheseModel
             *
             * @description
             *
             * Fetches belongsTo relation parent.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.parent = function() {
          var TargetResource = $injector.get("Item");
          var action = TargetResource["::get::KoheseModel::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.KoheseModel.analysis
     * @header lbServices.KoheseModel.analysis
     * @object
     * @description
     *
     * The object `KoheseModel.analysis` groups methods
     * manipulating `Analysis` instances related to `KoheseModel`.
     *
     * Call {@link lbServices.KoheseModel#analysis KoheseModel.analysis()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.KoheseModel#analysis
             * @methodOf lbServices.KoheseModel
             *
             * @description
             *
             * Fetches hasOne relation analysis.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::get::KoheseModel::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.analysis#create
             * @methodOf lbServices.KoheseModel.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.create = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::create::KoheseModel::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.analysis#createMany
             * @methodOf lbServices.KoheseModel.analysis
             *
             * @description
             *
             * Creates a new instance in analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
             * This usually means the response is a `Analysis` object.)
             * </em>
             */
        R.analysis.createMany = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::createMany::KoheseModel::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.analysis#destroy
             * @methodOf lbServices.KoheseModel.analysis
             *
             * @description
             *
             * Deletes analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.destroy = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::destroy::KoheseModel::analysis"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.KoheseModel.analysis#update
             * @methodOf lbServices.KoheseModel.analysis
             *
             * @description
             *
             * Update analysis of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Item id
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
        R.analysis.update = function() {
          var TargetResource = $injector.get("Analysis");
          var action = TargetResource["::update::KoheseModel::analysis"];
          return action.apply(R, arguments);
        };


        return R;
      }]);


  module
  .factory('LoopBackAuth', function() {
    var props = ['accessTokenId', 'currentUserId', 'rememberMe'];
    var propsPrefix = '$LoopBack$';

    function LoopBackAuth() {
      var self = this;
      props.forEach(function(name) {
        self[name] = load(name);
      });
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.save = function() {
      var self = this;
      var storage = this.rememberMe ? localStorage : sessionStorage;
      props.forEach(function(name) {
        save(storage, name, self[name]);
      });
    };

    LoopBackAuth.prototype.setUser = function(accessTokenId, userId, userData) {
      this.accessTokenId = accessTokenId;
      this.currentUserId = userId;
      this.currentUserData = userData;
    };

    LoopBackAuth.prototype.clearUser = function() {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    };

    LoopBackAuth.prototype.clearStorage = function() {
      props.forEach(function(name) {
        save(sessionStorage, name, null);
        save(localStorage, name, null);
      });
    };

    return new LoopBackAuth();

    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    function save(storage, name, value) {
      try {
        var key = propsPrefix + name;
        if (value == null) value = '';
        storage[key] = value;
      } catch (err) {
        console.log('Cannot access local/session storage:', err);
      }
    }

    function load(name) {
      var key = propsPrefix + name;
      return localStorage[key] || sessionStorage[key] || null;
    }
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
  }])
  .factory('LoopBackAuthRequestInterceptor', ['$q', 'LoopBackAuth',
    function($q, LoopBackAuth) {
      return {
        'request': function(config) {
          // filter out external requests
          var host = getHost(config.url);
          if (host && host !== urlBaseHost) {
            return config;
          }

          if (LoopBackAuth.accessTokenId) {
            config.headers[authHeader] = LoopBackAuth.accessTokenId;
          } else if (config.__isGetCurrentUser__) {
            // Return a stub 401 error for User.getCurrent() when
            // there is no user logged in
            var res = {
              body: { error: { status: 401 }},
              status: 401,
              config: config,
              headers: function() { return undefined; },
            };
            return $q.reject(res);
          }
          return config || $q.when(config);
        },
      };
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
    this.setAuthHeader = function(header) {
      authHeader = header;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the header name that is used for sending the authentication token.
     */
    this.getAuthHeader = function() {
      return authHeader;
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
    this.setUrlBase = function(url) {
      urlBase = url;
      urlBaseHost = getHost(urlBase) || location.host;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the URL of the REST API server. The URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.getUrlBase = function() {
      return urlBase;
    };

    this.$get = ['$resource', function($resource) {
      var LoopBackResource = function(url, params, actions) {
        var resource = $resource(url, params, actions);

        // Angular always calls POST on $save()
        // This hack is based on
        // http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
        resource.prototype.$save = function(success, error) {
          // Fortunately, LoopBack provides a convenient `upsert` method
          // that exactly fits our needs.
          var result = resource.upsert.call(this, {}, this, success, error);
          return result.$promise || result;
        };
        return resource;
      };

      LoopBackResource.getUrlBase = function() {
        return urlBase;
      };

      LoopBackResource.getAuthHeader = function() {
        return authHeader;
      };

      return LoopBackResource;
    }];
  });
})(window, window.angular);
}
