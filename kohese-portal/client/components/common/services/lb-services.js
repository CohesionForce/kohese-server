export default () => {
(function(window, angular, undefined) {'use strict';

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
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/Items/:id",
      { 'id': '@id' },
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

        // INTERNAL. Use KohesePrincipal.children.findById() instead.
        "::findById::KohesePrincipal::children": {
          url: urlBase + "/KohesePrincipals/:id/children/:fk",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children.destroyById() instead.
        "::destroyById::KohesePrincipal::children": {
          url: urlBase + "/KohesePrincipals/:id/children/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children.updateById() instead.
        "::updateById::KohesePrincipal::children": {
          url: urlBase + "/KohesePrincipals/:id/children/:fk",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.children2.findById() instead.
        "::findById::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/:fk",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children2.destroyById() instead.
        "::destroyById::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children2.updateById() instead.
        "::updateById::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/:fk",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.children2.link() instead.
        "::link::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/rel/:fk",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.children2.unlink() instead.
        "::unlink::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/rel/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children2.exists() instead.
        "::exists::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/rel/:fk",
          method: "HEAD"
        },

        // INTERNAL. Use KohesePrincipal.parent() instead.
        "::get::KohesePrincipal::parent": {
          url: urlBase + "/KohesePrincipals/:id/parent",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children() instead.
        "::get::KohesePrincipal::children": {
          isArray: true,
          url: urlBase + "/KohesePrincipals/:id/children",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children.create() instead.
        "::create::KohesePrincipal::children": {
          url: urlBase + "/KohesePrincipals/:id/children",
          method: "POST"
        },

        // INTERNAL. Use KohesePrincipal.children.destroyAll() instead.
        "::delete::KohesePrincipal::children": {
          url: urlBase + "/KohesePrincipals/:id/children",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children.count() instead.
        "::count::KohesePrincipal::children": {
          url: urlBase + "/KohesePrincipals/:id/children/count",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children2() instead.
        "::get::KohesePrincipal::children2": {
          isArray: true,
          url: urlBase + "/KohesePrincipals/:id/children2",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children2.create() instead.
        "::create::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2",
          method: "POST"
        },

        // INTERNAL. Use KohesePrincipal.children2.destroyAll() instead.
        "::delete::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children2.count() instead.
        "::count::KohesePrincipal::children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/count",
          method: "GET"
        },

        // INTERNAL. Use Category.children.findById() instead.
        "::findById::Category::children": {
          url: urlBase + "/Categories/:id/children/:fk",
          method: "GET"
        },

        // INTERNAL. Use Category.children.destroyById() instead.
        "::destroyById::Category::children": {
          url: urlBase + "/Categories/:id/children/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children.updateById() instead.
        "::updateById::Category::children": {
          url: urlBase + "/Categories/:id/children/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Category.children2.findById() instead.
        "::findById::Category::children2": {
          url: urlBase + "/Categories/:id/children2/:fk",
          method: "GET"
        },

        // INTERNAL. Use Category.children2.destroyById() instead.
        "::destroyById::Category::children2": {
          url: urlBase + "/Categories/:id/children2/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children2.updateById() instead.
        "::updateById::Category::children2": {
          url: urlBase + "/Categories/:id/children2/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Category.children2.link() instead.
        "::link::Category::children2": {
          url: urlBase + "/Categories/:id/children2/rel/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Category.children2.unlink() instead.
        "::unlink::Category::children2": {
          url: urlBase + "/Categories/:id/children2/rel/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children2.exists() instead.
        "::exists::Category::children2": {
          url: urlBase + "/Categories/:id/children2/rel/:fk",
          method: "HEAD"
        },

        // INTERNAL. Use Category.parent() instead.
        "::get::Category::parent": {
          url: urlBase + "/Categories/:id/parent",
          method: "GET"
        },

        // INTERNAL. Use Category.children() instead.
        "::get::Category::children": {
          isArray: true,
          url: urlBase + "/Categories/:id/children",
          method: "GET"
        },

        // INTERNAL. Use Category.children.create() instead.
        "::create::Category::children": {
          url: urlBase + "/Categories/:id/children",
          method: "POST"
        },

        // INTERNAL. Use Category.children.destroyAll() instead.
        "::delete::Category::children": {
          url: urlBase + "/Categories/:id/children",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children.count() instead.
        "::count::Category::children": {
          url: urlBase + "/Categories/:id/children/count",
          method: "GET"
        },

        // INTERNAL. Use Category.children2() instead.
        "::get::Category::children2": {
          isArray: true,
          url: urlBase + "/Categories/:id/children2",
          method: "GET"
        },

        // INTERNAL. Use Category.children2.create() instead.
        "::create::Category::children2": {
          url: urlBase + "/Categories/:id/children2",
          method: "POST"
        },

        // INTERNAL. Use Category.children2.destroyAll() instead.
        "::delete::Category::children2": {
          url: urlBase + "/Categories/:id/children2",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children2.count() instead.
        "::count::Category::children2": {
          url: urlBase + "/Categories/:id/children2/count",
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
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
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
          method: "POST"
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

        // INTERNAL. Use KohesePrincipal.analysis() instead.
        "::get::KohesePrincipal::analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.analysis.create() instead.
        "::create::KohesePrincipal::analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "POST"
        },

        // INTERNAL. Use KohesePrincipal.analysis.update() instead.
        "::update::KohesePrincipal::analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.analysis.destroy() instead.
        "::destroy::KohesePrincipal::analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "DELETE"
        },

        // INTERNAL. Use Category.analysis() instead.
        "::get::Category::analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "GET"
        },

        // INTERNAL. Use Category.analysis.create() instead.
        "::create::Category::analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "POST"
        },

        // INTERNAL. Use Category.analysis.update() instead.
        "::update::Category::analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "PUT"
        },

        // INTERNAL. Use Category.analysis.destroy() instead.
        "::destroy::Category::analysis": {
          url: urlBase + "/Categories/:id/analysis",
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

/**
 * @ngdoc object
 * @name lbServices.KohesePrincipal
 * @header lbServices.KohesePrincipal
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `KohesePrincipal` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
module.factory(
  "KohesePrincipal",
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/KohesePrincipals/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use KohesePrincipal.children.findById() instead.
        "prototype$__findById__children": {
          url: urlBase + "/KohesePrincipals/:id/children/:fk",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children.destroyById() instead.
        "prototype$__destroyById__children": {
          url: urlBase + "/KohesePrincipals/:id/children/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children.updateById() instead.
        "prototype$__updateById__children": {
          url: urlBase + "/KohesePrincipals/:id/children/:fk",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.children2.findById() instead.
        "prototype$__findById__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/:fk",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children2.destroyById() instead.
        "prototype$__destroyById__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children2.updateById() instead.
        "prototype$__updateById__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/:fk",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.children2.link() instead.
        "prototype$__link__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/rel/:fk",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.children2.unlink() instead.
        "prototype$__unlink__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/rel/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children2.exists() instead.
        "prototype$__exists__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/rel/:fk",
          method: "HEAD"
        },

        // INTERNAL. Use KohesePrincipal.parent() instead.
        "prototype$__get__parent": {
          url: urlBase + "/KohesePrincipals/:id/parent",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.analysis() instead.
        "prototype$__get__analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.analysis.create() instead.
        "prototype$__create__analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "POST"
        },

        // INTERNAL. Use KohesePrincipal.analysis.update() instead.
        "prototype$__update__analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "PUT"
        },

        // INTERNAL. Use KohesePrincipal.analysis.destroy() instead.
        "prototype$__destroy__analysis": {
          url: urlBase + "/KohesePrincipals/:id/analysis",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children() instead.
        "prototype$__get__children": {
          isArray: true,
          url: urlBase + "/KohesePrincipals/:id/children",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children.create() instead.
        "prototype$__create__children": {
          url: urlBase + "/KohesePrincipals/:id/children",
          method: "POST"
        },

        // INTERNAL. Use KohesePrincipal.children.destroyAll() instead.
        "prototype$__delete__children": {
          url: urlBase + "/KohesePrincipals/:id/children",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children.count() instead.
        "prototype$__count__children": {
          url: urlBase + "/KohesePrincipals/:id/children/count",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children2() instead.
        "prototype$__get__children2": {
          isArray: true,
          url: urlBase + "/KohesePrincipals/:id/children2",
          method: "GET"
        },

        // INTERNAL. Use KohesePrincipal.children2.create() instead.
        "prototype$__create__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2",
          method: "POST"
        },

        // INTERNAL. Use KohesePrincipal.children2.destroyAll() instead.
        "prototype$__delete__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2",
          method: "DELETE"
        },

        // INTERNAL. Use KohesePrincipal.children2.count() instead.
        "prototype$__count__children2": {
          url: urlBase + "/KohesePrincipals/:id/children2/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#create
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        "create": {
          url: urlBase + "/KohesePrincipals",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#upsert
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        "upsert": {
          url: urlBase + "/KohesePrincipals",
          method: "PUT"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#exists
         * @methodOf lbServices.KohesePrincipal
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
          url: urlBase + "/KohesePrincipals/:id/exists",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#findById
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        "findById": {
          url: urlBase + "/KohesePrincipals/:id",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#find
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        "find": {
          isArray: true,
          url: urlBase + "/KohesePrincipals",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#findOne
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        "findOne": {
          url: urlBase + "/KohesePrincipals/findOne",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#updateAll
         * @methodOf lbServices.KohesePrincipal
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
          url: urlBase + "/KohesePrincipals/update",
          method: "POST"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#deleteById
         * @methodOf lbServices.KohesePrincipal
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
          url: urlBase + "/KohesePrincipals/:id",
          method: "DELETE"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#count
         * @methodOf lbServices.KohesePrincipal
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
          url: urlBase + "/KohesePrincipals/count",
          method: "GET"
        },

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#prototype$updateAttributes
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        "prototype$updateAttributes": {
          url: urlBase + "/KohesePrincipals/:id",
          method: "PUT"
        },
      }
    );



        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#updateOrCreate
         * @methodOf lbServices.KohesePrincipal
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
         * This usually means the response is a `KohesePrincipal` object.)
         * </em>
         */
        R["updateOrCreate"] = R["upsert"];

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#update
         * @methodOf lbServices.KohesePrincipal
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
         * @name lbServices.KohesePrincipal#destroyById
         * @methodOf lbServices.KohesePrincipal
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
         * @name lbServices.KohesePrincipal#removeById
         * @methodOf lbServices.KohesePrincipal
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
    * @name lbServices.KohesePrincipal#modelName
    * @propertyOf lbServices.KohesePrincipal
    * @description
    * The name of the model represented by this $resource,
    * i.e. `KohesePrincipal`.
    */
    R.modelName = "KohesePrincipal";

    /**
     * @ngdoc object
     * @name lbServices.KohesePrincipal.children
     * @header lbServices.KohesePrincipal.children
     * @object
     * @description
     *
     * The object `KohesePrincipal.children` groups methods
     * manipulating `Item` instances related to `KohesePrincipal`.
     *
     * Call {@link lbServices.KohesePrincipal#children KohesePrincipal.children()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#children
         * @methodOf lbServices.KohesePrincipal
         *
         * @description
         *
         * Queries children of KohesePrincipal.
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
          var action = TargetResource["::get::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children#count
         * @methodOf lbServices.KohesePrincipal.children
         *
         * @description
         *
         * Counts children of KohesePrincipal.
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
          var action = TargetResource["::count::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children#create
         * @methodOf lbServices.KohesePrincipal.children
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
          var action = TargetResource["::create::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children#destroyAll
         * @methodOf lbServices.KohesePrincipal.children
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
          var action = TargetResource["::delete::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children#destroyById
         * @methodOf lbServices.KohesePrincipal.children
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
          var action = TargetResource["::destroyById::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children#findById
         * @methodOf lbServices.KohesePrincipal.children
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
          var action = TargetResource["::findById::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children#updateById
         * @methodOf lbServices.KohesePrincipal.children
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
          var action = TargetResource["::updateById::KohesePrincipal::children"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.KohesePrincipal.children2
     * @header lbServices.KohesePrincipal.children2
     * @object
     * @description
     *
     * The object `KohesePrincipal.children2` groups methods
     * manipulating `Item` instances related to `KohesePrincipal`.
     *
     * Call {@link lbServices.KohesePrincipal#children2 KohesePrincipal.children2()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#children2
         * @methodOf lbServices.KohesePrincipal
         *
         * @description
         *
         * Queries children2 of KohesePrincipal.
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
          var action = TargetResource["::get::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#count
         * @methodOf lbServices.KohesePrincipal.children2
         *
         * @description
         *
         * Counts children2 of KohesePrincipal.
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
          var action = TargetResource["::count::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#create
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::create::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#destroyAll
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::delete::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#destroyById
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::destroyById::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#exists
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::exists::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#findById
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::findById::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#link
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::link::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#unlink
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::unlink::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.children2#updateById
         * @methodOf lbServices.KohesePrincipal.children2
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
          var action = TargetResource["::updateById::KohesePrincipal::children2"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#parent
         * @methodOf lbServices.KohesePrincipal
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
          var action = TargetResource["::get::KohesePrincipal::parent"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.KohesePrincipal.analysis
     * @header lbServices.KohesePrincipal.analysis
     * @object
     * @description
     *
     * The object `KohesePrincipal.analysis` groups methods
     * manipulating `Analysis` instances related to `KohesePrincipal`.
     *
     * Call {@link lbServices.KohesePrincipal#analysis KohesePrincipal.analysis()}
     * to query all related instances.
     */


        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal#analysis
         * @methodOf lbServices.KohesePrincipal
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
          var action = TargetResource["::get::KohesePrincipal::analysis"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.analysis#create
         * @methodOf lbServices.KohesePrincipal.analysis
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
          var action = TargetResource["::create::KohesePrincipal::analysis"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.analysis#destroy
         * @methodOf lbServices.KohesePrincipal.analysis
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
          var action = TargetResource["::destroy::KohesePrincipal::analysis"];
          return action.apply(R, arguments);
        };

        /**
         * @ngdoc method
         * @name lbServices.KohesePrincipal.analysis#update
         * @methodOf lbServices.KohesePrincipal.analysis
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
          var action = TargetResource["::update::KohesePrincipal::analysis"];
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
  ['LoopBackResource', 'LoopBackAuth', '$injector', function(Resource, LoopBackAuth, $injector) {
    var R = Resource(
      urlBase + "/Categories/:id",
      { 'id': '@id' },
      {

        // INTERNAL. Use Category.children.findById() instead.
        "prototype$__findById__children": {
          url: urlBase + "/Categories/:id/children/:fk",
          method: "GET"
        },

        // INTERNAL. Use Category.children.destroyById() instead.
        "prototype$__destroyById__children": {
          url: urlBase + "/Categories/:id/children/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children.updateById() instead.
        "prototype$__updateById__children": {
          url: urlBase + "/Categories/:id/children/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Category.children2.findById() instead.
        "prototype$__findById__children2": {
          url: urlBase + "/Categories/:id/children2/:fk",
          method: "GET"
        },

        // INTERNAL. Use Category.children2.destroyById() instead.
        "prototype$__destroyById__children2": {
          url: urlBase + "/Categories/:id/children2/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children2.updateById() instead.
        "prototype$__updateById__children2": {
          url: urlBase + "/Categories/:id/children2/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Category.children2.link() instead.
        "prototype$__link__children2": {
          url: urlBase + "/Categories/:id/children2/rel/:fk",
          method: "PUT"
        },

        // INTERNAL. Use Category.children2.unlink() instead.
        "prototype$__unlink__children2": {
          url: urlBase + "/Categories/:id/children2/rel/:fk",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children2.exists() instead.
        "prototype$__exists__children2": {
          url: urlBase + "/Categories/:id/children2/rel/:fk",
          method: "HEAD"
        },

        // INTERNAL. Use Category.parent() instead.
        "prototype$__get__parent": {
          url: urlBase + "/Categories/:id/parent",
          method: "GET"
        },

        // INTERNAL. Use Category.analysis() instead.
        "prototype$__get__analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "GET"
        },

        // INTERNAL. Use Category.analysis.create() instead.
        "prototype$__create__analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "POST"
        },

        // INTERNAL. Use Category.analysis.update() instead.
        "prototype$__update__analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "PUT"
        },

        // INTERNAL. Use Category.analysis.destroy() instead.
        "prototype$__destroy__analysis": {
          url: urlBase + "/Categories/:id/analysis",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children() instead.
        "prototype$__get__children": {
          isArray: true,
          url: urlBase + "/Categories/:id/children",
          method: "GET"
        },

        // INTERNAL. Use Category.children.create() instead.
        "prototype$__create__children": {
          url: urlBase + "/Categories/:id/children",
          method: "POST"
        },

        // INTERNAL. Use Category.children.destroyAll() instead.
        "prototype$__delete__children": {
          url: urlBase + "/Categories/:id/children",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children.count() instead.
        "prototype$__count__children": {
          url: urlBase + "/Categories/:id/children/count",
          method: "GET"
        },

        // INTERNAL. Use Category.children2() instead.
        "prototype$__get__children2": {
          isArray: true,
          url: urlBase + "/Categories/:id/children2",
          method: "GET"
        },

        // INTERNAL. Use Category.children2.create() instead.
        "prototype$__create__children2": {
          url: urlBase + "/Categories/:id/children2",
          method: "POST"
        },

        // INTERNAL. Use Category.children2.destroyAll() instead.
        "prototype$__delete__children2": {
          url: urlBase + "/Categories/:id/children2",
          method: "DELETE"
        },

        // INTERNAL. Use Category.children2.count() instead.
        "prototype$__count__children2": {
          url: urlBase + "/Categories/:id/children2/count",
          method: "GET"
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
          method: "POST"
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
          method: "PUT"
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
          method: "GET"
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
          method: "GET"
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
          method: "GET"
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
          method: "GET"
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
         * This method returns no data.
         */
        "updateAll": {
          url: urlBase + "/Categories/update",
          method: "POST"
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
         * This method returns no data.
         */
        "deleteById": {
          url: urlBase + "/Categories/:id",
          method: "DELETE"
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
          method: "GET"
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
          method: "PUT"
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
         * This method returns no data.
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
         * This method returns no data.
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
         * This method returns no data.
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


module
  .factory('LoopBackAuth', function() {
    var props = ['accessTokenId', 'currentUserId'];
    var propsPrefix = '$LoopBack$';

    function LoopBackAuth() {
      var self = this;
      props.forEach(function(name) {
        self[name] = load(name);
      });
      this.rememberMe = undefined;
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
    }

    LoopBackAuth.prototype.clearUser = function() {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    }

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
      var key = propsPrefix + name;
      if (value == null) value = '';
      storage[key] = value;
    }

    function load(name) {
      var key = propsPrefix + name;
      return localStorage[key] || sessionStorage[key] || null;
    }
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
  }])
  .factory('LoopBackAuthRequestInterceptor', [ '$q', 'LoopBackAuth',
    function($q, LoopBackAuth) {
      return {
        'request': function(config) {

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
              body: { error: { status: 401 } },
              status: 401,
              config: config,
              headers: function() { return undefined; }
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
    this.setAuthHeader = function(header) {
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
    this.setUrlBase = function(url) {
      urlBase = url;
    };

    this.$get = ['$resource', function($resource) {
      return function(url, params, actions) {
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
    }];
  });

})(window, window.angular);
}
