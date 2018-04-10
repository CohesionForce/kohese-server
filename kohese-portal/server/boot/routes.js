/**
 * Created by josh on 9/8/15.
 */
module.exports = function (app) {
    var jwt = require('jsonwebtoken');
    var jwtSecret = 'ij2ijo32iro2i3jrod111223';
    var expressJwt = require('express-jwt');
    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var util = require('util');
    var serveIndex = require('serve-index');
    var serveFavicon = require('serve-favicon');
    var fs = require('fs');

    var serverAuthentication = require('../server-enableAuth.js');

    var clientBundlePath = path.resolve(__dirname, '../../client/bundle');

    app.use(express.static(clientBundlePath));

    var ngRoutes = [
      /^\/admin.*/,
      /^\/dashboard.*/,
      /^\/login/,
      /^\/repositories.*/,
      /^\/explore.*/,
      /^\/analysis.*/,
      /^\/typeeditor.*/
    ];

    app.use(ngRoutes, function (req, res) {
      res.sendFile(path.resolve(clientBundlePath, 'index.html'));
    });


    //TODO Need to move this to the client-ng2 directory too
    app.use(serveFavicon(path.resolve(__dirname, '../../client/assets/icons/favicon.ico')));

    app.use('/socket.io-file-client',
            express.static(path.resolve(__dirname, '../../node_modules/socket.io-file-client')));

    app.use('/reports', serveIndex('tmp_reports', {'icons':true, 'view':'details'}));
    app.use('/reports', express.static(path.resolve(__dirname, '../../tmp_reports')));

    app.use(bodyParser.json());

    app.post('/authenticate', authenticate);


    function authenticate(req, res, next) {
        console.log('$$$ Authenticate');

        var body = req.body;
        console.log('::: Checking: ' + body.username);

        if (!body.username) {
          res.status(400).end('Must provide username');
          return;
        }

        if (!body.password) {
          res.status(400).end('Must provide password');
          return;
        }

        serverAuthentication.login(body.username, body.password, function processCallback(err, user) {
          if (err){
            res.status(401).end('Login failed: ' + err);
            return;
          }

          console.log('::: Authenticated: ' + user.name + ' - ' + user.description);
          var token = jwt.sign({
            username: req.body.username
          }, jwtSecret);
          res.send(token);
        });
    }

    app.use(function(req,res,next){
      console.log('At:      ' + Date.now());
      console.log('Request: ' + req.url);
      console.log('Method:  ' + req.method);
      console.log('Query:   ' + util.inspect(req.query,false,null));
//      console.log('Headers:  ');
//      console.log(req.headers);

      // check to see if the authorization header is missing, but an auth_token was provided

      // jshint -W106
      if(!req.headers.authorization && req.query.access_token){
        console.log('$$$ Auth Token: ' + req.query.access_token);
        console.log('::: Creating authorization header from access_token');
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      console.log('$$$ Authorization: ' + req.headers.authorization);
      // jshint +W106
      next();
    });

    app.use(expressJwt({secret: jwtSecret}).unless({path: ngRoutes}));

    function decodeAuthToken(authToken){
      var decodedToken = jwt.verify(authToken, jwtSecret);
      return decodedToken;
    }
    module.exports.decodeAuthToken = decodeAuthToken;

    app.use(function (req, res, next){
      var authHeader = (req.headers.authorization);

      if (authHeader) {
        var header = authHeader.replace('Bearer ', '');
        req.headers.koheseUser = jwt.verify(header, jwtSecret);
      } else {
        console.log('*** Authorization header is missing');
      }

      console.log('$$$ User: ' + req.headers.koheseUser);
      console.log('User:    ' + util.inspect(req.headers.koheseUser,false,null));
      next();
    });

};
