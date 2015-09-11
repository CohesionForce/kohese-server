/**
 * Created by josh on 9/8/15.
 */
module.exports = function (app) {
    var jwt = require('jsonwebtoken');
    var jwtSecret = 'ij2ijo32iro2i3jrod111223';
    var expressJwt = require('express-jwt');
    var loopback = require('loopback');
    var path = require('path');
    var bodyParser = require('body-parser');
    var util = require('util');

    app.use(loopback.static(path.resolve(__dirname, '../../client')));
    app.use(loopback.static(path.resolve(__dirname, '../../bower_components')));

    app.use(bodyParser.json());

    app.post('/login', authenticate);

    function authenticate(req, res, next) {
        var body = req.body;
        console.log("::: Checking: " + body.username);
        if (!body.username || !body.password) {
            res.status(400).end('Must provide username or password')
        }
        if (body.username != body.password) {
            res.status(401).end('Username or password incorrect');
        }
        console.log("::: Authenticated: " + req.body.username);

        var token = jwt.sign({
          username: req.body.username
        }, jwtSecret);
        res.send(token);
        
    }

    app.use(function(req,res,next){
      console.log("At:      " + Date.now());
      console.log("Request: " + req.url);
      console.log("Method:  " + req.method);
      console.log("Query:   " + util.inspect(req.query,false,null));
//      console.log("Headers:  ");
//      console.log(req.headers);
      
      // check to see if the authorization header is missing, but an auth_token was provided
      if(!req.headers.authorization && req.query.access_token){
        console.log("::: Creating authorization header from access_token")
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      next();  
    });
    
    app.use(expressJwt({secret: jwtSecret}).unless({path: ['/login']}));

    app.use(function (req, res, next){
      var authHeader = (req.headers.authorization);
      var header = authHeader.replace('Bearer ', '');
      req.headers.koheseUser = jwt.verify(header, jwtSecret);
      console.log("User:    " + util.inspect(req.headers.koheseUser,false,null));
      next();
    });

    var restApiRoot = app.get('restApiRoot');
    app.use(restApiRoot, app.loopback.rest());
};