var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

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

    var kdb = require('./kdb.js');
    global.koheseKDB = kdb;
    
    // start the server if `$ node server.js`
    if (require.main === module) {

        // app.start();
        var decodeAuthToken = require('./boot/routes.js').decodeAuthToken;
        global.KoheseIO = require('socket.io')(app.start());
        global.KoheseIO.on('connection', function (socket) {
            console.log('>>> session %s connected from %s', socket.id, socket.handshake.address);
            
            socket.on('authenticate', function(request) {
              socket.koheseUser = decodeAuthToken(request.token); 
              console.log('>>>> session %s is user %s', socket.id, socket.koheseUser.username);
              socket.emit('authenticated');
            });
            socket.on('disconnect', function () {
              var username = "Unknown";
              if (socket.koheseUser){
                username = socket.koheseUser.username;
              }
              console.log('>>> session %s: user %s disconnected from %s', socket.id, username, socket.handshake.address);
            });
        });
    }

});
