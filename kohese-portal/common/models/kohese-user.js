module.exports = function(KoheseUser) {

  var SALT_WORK_FACTOR = 10;

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

  KoheseUser.setter.password = function(password) {
    if (password.indexOf('$2a$') === 0 && password.length === 60) {
      // The password is already hashed. It can be the case
      // when the instance is loaded from DB
      this.$password = password;
    } else {
      this.$password = this.constructor.hashPassword(password);
    }
  };

  /**
   * Compare the given `password` with the users hashed password.
   *
   * @param {String} password The plain text password
   * @returns {Boolean}
   */

  KoheseUser.prototype.hasPassword = function(plainPassword, fn) {
    if (this.password && plainPassword) {
      bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return fn(err);
        fn(null, isMatch);
      });
    } else {
      fn(null, false);
    }
  };


  /*!
   * Hash the plain password
   */
  KoheseUser.hashPassword = function(plainPassword) {
    this.validatePassword(plainPassword);
    var salt = bcrypt.genSaltSync(this.settings.saltWorkFactor || SALT_WORK_FACTOR);
    return bcrypt.hashSync(plainPassword, salt);
  };

  KoheseUser.validatePassword = function(plainPassword) {
    if (typeof plainPassword === 'string' && plainPassword) {
      return true;
    }
    var err =  new Error('Invalid password: ' + plainPassword);
    err.statusCode = 422;
    throw err;
  };
  
  // This function is an adaptation of the Loopback User.login function
  // cb (err, user)
  KoheseUser.login = function (username, password, cb){
    console.log("::: Preparing to evaluate credentials");

    this.findOne({where: {name: username}}, function(err, user) {
      if (err) {
        console.log('*** An error is reported from KoheseUser.findOne: %j', err);
        cb(err, null);
      } else if (user) {
        user.hasPassword(password, function(err, isMatch) {
          if (err) {
            console.log('*** An error is reported from KoheseUser.hasPassword: %j', err);
            cb(err,null);
          } else if (isMatch) {
            cb(null, user);
          } else {
            console.log('*** The password is invalid for user %s', username);
            cb("Invalid password", null);
          }
        });
      } else {
        console.log('*** No matching record is found for user %s', username);
        cb("No such user", null);
      }
    });
  };
  
  // Remote methods are not inherited
  KoheseUser.beforeRemote('create', KoheseUser.addModificationHistory);
  KoheseUser.beforeRemote('upsert', KoheseUser.addModificationHistory);

};
