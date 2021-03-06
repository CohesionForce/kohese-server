/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


/**
 * Created by josh on 9/8/15.
 */
module.exports = function (app) {
    var jwtToken = require('jsonwebtoken');
    var jwtSecret;
    var { expressjwt: jwt } = require("express-jwt");
    var express = require('express');
    var rateLimit = require('express-rate-limit');
    var path = require('path');
    var bodyParser = require('body-parser');
    var util = require('util');
    var serveFavicon = require('serve-favicon');
    var fs = require('fs');

    var secretObject = { secret: 'ij2ijo32iro2i3jrod111223' }
    var secretJSON = JSON.stringify(secretObject, null, 2);
    var jsonString;
    var parsed;

    if(fs.existsSync('./server/boot/jwt-auth.json')) {
      jsonString = fs.readFileSync('./server/boot/jwt-auth.json');
      parsed = JSON.parse(jsonString);
      jwtSecret = parsed['secret'];
    } else {
      fs.writeFileSync('./server/boot/jwt-auth.json', secretJSON);
      jsonString = fs.readFileSync('./server/boot/jwt-auth.json');
      parsed = JSON.parse(jsonString);
      jwtSecret = parsed['secret'];
    }

    var serverAuthentication = require('../server-enableAuth');

    var clientBundlePath = path.resolve(__dirname, '../../client/bundle');

    app.use(express.static(clientBundlePath));

    var ngRoutes = [
      /^\/admin.*/,
      /^\/dashboard.*/,
      /^\/login/,
      /^\/versions.*/,
      /^\/repositories.*/,
      /^\/explore.*/,
      /^\/analysis.*/,
      /^\/kindeditor.*/,
      /^\/devtools.*/,
      /^\/about.*/,
      /^\/outline.*/,
      /^\/reports.*/
    ];

    // set up rate limiter: safe maximum of requests per minute
    var limiter = rateLimit({
      windowMs: 1*60*1000, // 1 minute
      max: 20
    });

    // apply rate limiter to all requests
    app.use(limiter);

    app.use(ngRoutes, function (req, res) {
      res.sendFile(path.resolve(clientBundlePath, 'index.html'));
    });

    //TODO Need to move this to the client-ng2 directory too
    app.use(serveFavicon(path.resolve(__dirname, '../../client/bundle/assets/icons/favicon.ico')));

    app.use('/producedReports', express.static(path.resolve(__dirname,
      '../../../reports')));

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
          var token = jwtToken.sign({
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

    app.use(jwt({
      secret: jwtSecret,
      algorithms: ['HS256'],
    }).unless({path: ngRoutes}) );

    function decodeAuthToken(authToken){
      var decodedToken = jwtToken.verify(authToken, jwtSecret);
      return decodedToken;
    }
    module.exports.decodeAuthToken = decodeAuthToken;

    app.use(function (req, res, next){
      var authHeader = (req.headers.authorization);

      if (authHeader) {
        var header = authHeader.replace('Bearer ', '');
        req.headers.koheseUser = jwtToken.verify(header, jwtSecret);
      } else {
        console.log('*** Authorization header is missing');
      }

      console.log('$$$ User: ' + req.headers.koheseUser);
      console.log('User:    ' + util.inspect(req.headers.koheseUser,false,null));
      next();
    });

};
