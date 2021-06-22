/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { ItemProxy } from '../common/src/item-proxy';
var kdb = require('./kdb');

var usersProxy : ItemProxy;

const SALT_WORK_FACTOR = 10;

var bcrypt;
try {
  // Try the native module first
  bcrypt = require('bcrypt');
  // Browserify returns an empty object
  if (bcrypt && typeof bcrypt.compare !== 'function') {
    bcrypt = require('bcryptjs');
  }
} catch (err) {
  // Fall back to pure JS impl
  bcrypt = require('bcryptjs');
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkAndCreateUsersItem() {

  var rootProxy = ItemProxy.getWorkingTree().getRootProxy();

  usersProxy = rootProxy.getChildByName('Users');

  if (!usersProxy){
    // Create Users Item
    console.log('::: Creating Users Item');
    var now = Date.now();
    usersProxy =  new ItemProxy('Item', {
      name: 'Users',
      description: 'User accounts',
      createdBy: 'admin',
      createdOn: now,
      modifiedBy: 'admin',
      modifiedOn: now
    });
    kdb.storeModelInstance(usersProxy, true).then((status) => {
      console.log('::: Users Item written to disk');
    });
  } else {
    console.log('::: Users Item already exists');
    console.log(JSON.stringify(usersProxy.cloneItemAndStripDerived(),null,'  '));
  }

  checkAndCreateAdminAccount();
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function checkAndCreateAdminAccount() {

  var adminProxy = usersProxy.getChildByName('admin');

  if (!adminProxy){
    console.log('::: Creating admin account');
    var now = Date.now();
    adminProxy = new ItemProxy('KoheseUser', {
       name: 'admin',
       description: 'Administrator',
       parentId: usersProxy.item.id,
       password: hashPassword('kohese'),
       createdBy: 'admin',
       createdOn: now,
       modifiedBy: 'admin',
       modifiedOn: now
    });
    kdb.storeModelInstance(adminProxy, true).then((status) => {
      console.log('::: Admin user written to disk');
    });
  } else {
    console.log('::: Admin account already exists');
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function setPassword(item, password) {
  if (password.indexOf('$2a$') === 0 && password.length === 60) {
    // The password is already hashed. It can be the case
    // when the instance is loaded from DB
    item.password = password;
  } else {
    item.password = hashPassword(password);
  }
}
module.exports.setPassword = setPassword;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
/**
 * Compare the given `password` with the users hashed password.
 *
 * @param {String} password The plain text password
 * @returns {Boolean}
 */

function hasPassword(proxy, plainPassword, fn) {
  if (proxy.item.password && plainPassword) {
    bcrypt.compare(plainPassword, proxy.item.password, function(err, isMatch) {
      if (err) return fn(err);
      fn(null, isMatch);
    });
  } else {
    fn(null, false);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
/*!
 * Hash the plain password
 */
function hashPassword(plainPassword) {
  validatePassword(plainPassword);
  var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  return bcrypt.hashSync(plainPassword, salt);
}
module.exports.hashPassword = hashPassword;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function validatePassword(plainPassword) {
  if (typeof plainPassword === 'string' && plainPassword) {
    return true;
  }
  var err : any =  new Error('Invalid password: ' + plainPassword);
  err.statusCode = 422;
  throw err;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function login(username, password, cb){
  console.log('::: Preparing to evaluate credentials');

  var userProxy = usersProxy.getChildByName(username);

  if (userProxy){
    hasPassword(userProxy, password, function(err, isMatch) {
      if (err) {
        console.log('*** An error is reported from KoheseUser.hasPassword: %j', err);
        cb(err, null);
      } else if (isMatch) {
        cb(null, userProxy.item);
      } else {
        console.log('*** The password is invalid for user %s', username);
        cb('Invalid password', null);
      }
    });
  } else {
    console.log('*** No matching record is found for user %s', username);
    cb('No such user', null);
  }

}
module.exports.login = login;

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
console.log('::: Checking if users and admin account exist');
checkAndCreateUsersItem();
