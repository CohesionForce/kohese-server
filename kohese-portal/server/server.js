var loopback = require('loopback');
var boot = require('loopback-boot');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var jwtSecret = 'ij2ijo32iro2i3jrod111223';

var app = module.exports = loopback();

app.use(bodyParser.json());
app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        console.log('Web server listening at: %s', app.get('url'));
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module) {

        // app.start();
        app.io = require('socket.io')(app.start());
        app.io.on('connection', function (socket) {
            console.log('a user connected: %s', socket.id);
            socket.on('disconnect', function () {
                console.log('user disconnected: %s', socket.id);
            });
        });
    }

});
