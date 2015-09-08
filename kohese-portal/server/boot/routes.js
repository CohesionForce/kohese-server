/**
 * Created by josh on 9/8/15.
 */
module.exports = function (app) {
    var jwt = require('jsonwebtoken');
    var jwtSecret = 'ij2ijo32iro2i3jrod111223';
    var expressJwt = require('express-jwt');
    var loopback = require('loopback');
    var path = require('path');

    var user = {
        username: 'user',
        password: 'user'
    };

    app.use(loopback.static(path.resolve(__dirname, '../../client')));
    app.use(loopback.static(path.resolve(__dirname, '../../bower_components')));

    var router = app.loopback.Router();

    router.get('/testnote', function (req, res) {
        res.send({title: 'Hello', description: 'World'})
    });

    router.post('/login', authenticate, function (req, res) {
        var token = jwt.sign({
            username: user.username
        }, jwtSecret);
        res.send(token);

    });

    function authenticate(req, res, next) {
        var body = req.body;
        if (!body.username || !body.password) {
            res.status(400).end('Must provide username or password')
        }
        if (body.username != user.username || body.password != user.password) {
            res.status(401).end('Username or password incorrect');
        }
        next();
    }

    router.use(function (req, res, next){
        console.log("At:      " + Date.now());
        console.log("Request: " + req.url);
        console.log("Method:  " + req.method);
        var fullheader = (req.headers.authorization);
        var header = fullheader.replace('Bearer ', '');
        req.headers.koheseUser = jwt.verify(header, jwtSecret);
        console.log("User:    " + req.header.koheseUser);
        next();
    });

    app.use(expressJwt({secret: jwtSecret}).unless({path: ['/login']}));
    app.use(router);
    var restApiRoot = app.get('restApiRoot');
    app.use(restApiRoot, app.loopback.rest());
};