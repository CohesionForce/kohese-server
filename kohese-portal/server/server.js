var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  //-- Mount static files here--
  //All static middleware should be registered at the end, as all requests
  //passing the static middleware are hitting the file system
  //Example:
  var path = require('path');
  app.use(loopback.static(path.resolve(__dirname, '../client')));
  app.use(loopback.static(__dirname + '../client'))

  // start the server if `$ node server.js`
  if (require.main === module) {

    // app.start();
    app.io = require('socket.io')(app.start());
    app.io.on('connection', function(socket) {
      console.log('a user connected: %s', socket.id);
      socket.on('disconnect', function() {
        console.log('user disconnected: %s', socket.id);
      });
    });
  }

});
